const { test, expect } = require('@playwright/test');

const gotoHome = async (page) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
};

test.describe('video scrub', () => {
  test('video metadata loads', async ({ page }) => {
    await gotoHome(page);
    await page.waitForFunction(
      () => {
        const v = document.querySelector('#scrubVideo');
        return v && v.readyState >= 1 && Number.isFinite(v.duration) && v.duration > 0;
      },
      null,
      { timeout: 45000 }
    );
    const d = await page.$eval('#scrubVideo', (v) => v.duration);
    expect(d).toBeGreaterThan(1);
  });

  test('currentTime increases when user scrolls down', async ({ page }) => {
    await gotoHome(page);
    await page.waitForFunction(
      () => {
        const v = document.querySelector('#scrubVideo');
        return v && Number.isFinite(v.duration) && v.duration > 0;
      },
      null,
      { timeout: 45000 }
    );
    const t0 = await page.$eval('#scrubVideo', (v) => v.currentTime);
    await page.evaluate(() => {
      window.scrollBy(0, 800);
      window.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 400, bubbles: true, clientX: 100, clientY: 100 })
      );
    });
    await page.waitForFunction(
      (start) => {
        const v = document.querySelector('#scrubVideo');
        return v && v.currentTime > start + 0.06;
      },
      t0,
      { timeout: 15000 }
    );
    const t1 = await page.$eval('#scrubVideo', (v) => v.currentTime);
    expect(t1).toBeGreaterThan(t0 + 0.06);
  });

  test('hero section visible and scrub does not stay at zero after deep scroll', async ({
    page,
  }) => {
    await gotoHome(page);
    await page.waitForFunction(
      () => {
        const v = document.querySelector('#scrubVideo');
        return v && Number.isFinite(v.duration) && v.duration > 0;
      },
      null,
      { timeout: 45000 }
    );
    const duration = await page.$eval('#scrubVideo', (v) => v.duration);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const start = await page.$eval('#scrubVideo', (v) => v.currentTime);
    expect(start / duration).toBeLessThan(0.25);

    await page.evaluate(() => {
      const range = document.querySelector('#videoScrub .video-scrub__scroll-range');
      const el = range || document.getElementById('videoScrub');
      if (el) {
        const y = el.offsetTop + el.offsetHeight - window.innerHeight;
        window.scrollTo(0, Math.max(0, y));
      }
      window.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 600, bubbles: true, clientX: 100, clientY: 100 })
      );
    });
    await page.waitForFunction(
      ({ prev, dur }) => {
        const v = document.querySelector('#scrubVideo');
        return v && v.currentTime > prev + 0.1 && v.currentTime / dur > 0.45;
      },
      { prev: start, dur: duration },
      { timeout: 20000 }
    );
    const end = await page.$eval('#scrubVideo', (v) => v.currentTime);
    expect(end / duration).toBeGreaterThan(0.5);
  });
});
