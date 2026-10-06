import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const interWeights = ['400', '500', '600', '700', '800'];

export const loadFonts = () =>
  Promise.all([
    ...interWeights.map((weight) =>
      loadFont({
        family: 'Inter',
        url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`),
        weight,
      }),
    ),
    loadFont({
      family: 'Anton',
      url: staticFile('fonts/anton-latin-400-normal.woff2'),
      weight: '400',
    }),
  ]);
