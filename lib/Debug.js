var Debug = {
  level: 3,
  LEVEL_EMERGENCY: 0,  // Emergency: system is unusable
  LEVEL_ALERT    : 1,  // Alert: action must be taken immediately
  LEVEL_CRITICAL : 2,  // Critical: critical conditions
  LEVEL_ERROR    : 3,  // Error: error conditions
  LEVEL_WARNING  : 4,  // Warning: warning conditions
  LEVEL_NOTICE   : 5,  // Notice: normal but significant condition
  LEVEL_INFO     : 6,  // Informational: informational messages
  LEVEL_DEBUG    : 7,  // Debug: debug messages
  LEVEL_DUMP     : 9,  // Debug dumps
  log: function(message, level) {
    this._log(message, level, 'log');
  },
  dir: function(object, level) {
    this._log(object, level, 'dir');
  },
  _log: function(object, level, fn) {
    if (undefined===level) {
      level = this.LEVEL_DUMP;
    }
    if (this.level<level) {
      return;
    }
    if (window.console && window.console[fn]) {
      window.console[fn](object);
    } else if (window.Ext && Ext.debug) {
      var map = {
        'log': 'log',
        'dir': 'dump'
      }
      if (map[fn]) {
        fn = map[fn];
      }
      if (Ext[fn]) {
        Ext[fn](object);
      }
    }
  }
};
