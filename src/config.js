window.VOCASCAN_CONFIG = {
  // inject default config options
  ENV: "web",
  BASE_URL: "",
  SHOW_PLANS: undefined,

  // inject build variables
  ...Object.entries(process.env).reduce((acc, [key, value]) => {
    if (key.startsWith("REACT_APP_VOCASCAN_")) {
      acc[key.replace(/^REACT_APP_VOCASCAN_/, "")] = value;
    }

    return acc;
  }, {}),

  // inject already existing config options
  ...window.VOCASCAN_CONFIG,
};

// if SHOW_PLANS is not configured but a BASE_URL is configured -> dont show the plans
if (window.VOCASCAN_CONFIG.SHOW_PLANS === undefined) {
  window.VOCASCAN_CONFIG.SHOW_PLANS = !window.VOCASCAN_CONFIG.BASE_URL;
}
