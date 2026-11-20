export const environment = {
  production: false,
  // ng serve proxies this to the API on localhost:9010 (proxy.conf.json), as nginx does on the
  // server. It used to be http://localhost:9000/api, which doubled the /api in every path.
  apiBaseUrl: '/filet-crochet-api',
  enableLogIn: false,
  sectionGrid: {
    /** When true the toolbar shows a popover with editable row/col inputs.
     *  When false the toolbar shows a simple on/off toggle using the defaults below. */
    configurable: false,
    defaultRowInterval: 10,
    defaultColInterval: 10,
  },
};
