
Ext.ns('Ext.ux.state');
Ext.ux.state.WebStorageProvider = Ext.extend(Ext.state.Provider, {

  constructor: function(config) {
    Ext.ux.state.WebStorageProvider.superclass.constructor.call(this);
    this.isSession = false;
    if (config) {
      Ext.apply(this, config);
    }
    if (this.isSession) {
      this.storage = window.sessionStorage;
    } else {
      this.storage = window.localStorage || window.globalStorage[window.location.hostname];
    }
    for (var i=0; i<this.storage.length; i++) {
      var key = this.storage.key(i);
      var value = this.storage.getItem(key);
      try {
        this.state[key] = Ext.util.JSON.decode(value);
      } catch (e) {
        this.state[key] = value;
      }
    }
  },

  // private
  set: function(name, value) {
    if(undefined === value || value === null){
      this.clear(name);
      return;
    }
    this.storage.setItem(name, Ext.util.JSON.encode(value));
    Ext.ux.state.WebStorageProvider.superclass.set.call(this, name, value);
  },

  // private
  /*get: function(name, defaultValue) {
    if (undefined === this.state[name]) {
      this.state[name] = this.storage.getItem(name);
    }
    return Ext.ux.state.WebStorageProvider.superclass.set.call(this, name, defaultValue);
  },*/

  // private
  clear : function(name){
    if (0==arguments.length) {
      this.storage.clear();
    } else {
      this.storage.removeItem(name);
    }
    Ext.ux.state.WebStorageProvider.superclass.clear.call(this, name);
  }
});

/**
 * @static
 */
Ext.ux.state.WebStorageProvider.isSupported = function() {
  if ((window.localStorage || window.globalStorage) && window.localStorage.getItem) {
    return true;
  }
  return false;
}
