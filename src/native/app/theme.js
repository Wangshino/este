import Color from 'color';

// Learn React Native styles:
//  - facebook.github.io/react-native/docs/style.html
//  - medium.com/@yoniweisbrod/a-mini-course-on-react-native-flexbox-2832a1ccc6
// Tips:
//  - Note there is no shared styles. Favour prestyled app/components instead.
//  - Use theme.fontSize for responsive layouts (mobile, tablet, etc.)
//    - example: paddingBottom: theme.fontSize * 1.5 // pxtoem.com
//  - Use Platform.select for platform specific styles and theme constants
//  - Use vocabulary from:
//    - v4-alpha.getbootstrap.com/getting-started/introduction
//    - developer.apple.com/ios/human-interface-guidelines
//    - developer.android.com/guide/practices/ui_guidelines

export default {
  fontSize: 16,

  textColor: '#7C7C7C',
  backgroundColor: '#fff',

  inverseTextColor: '#eee',
  inverseBackgroundColor: '#2C2C2C',

  brandPrimary: '#31AACC',

  activeOpacity: .5,
  disabledOpacity: .3,

  // Multiples from Bootstrap 4
  get fontSizeH1() { return this.fontSize * 2.5; },
  get fontSizeH2() { return this.fontSize * 2; },
  get fontSizeH3() { return this.fontSize * 1.75; },
  get fontSizeH4() { return this.fontSize * 1.5; },
  get fontSizeH5() { return this.fontSize * 1.25; },

  // Example: { borderBottomColor: theme.lighten(theme.brandPrimary) }
  lighten: color => Color(color).lighten(.3).hexString(),
  darken: color => Color(color).darken(.3).hexString(),
};
