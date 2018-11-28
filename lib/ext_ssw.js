
Ext.ns('Ext.ux.state');
Ext.ux.state.SSWProvider = Ext.extend(Ext.state.Provider, {

  constructor: function(config) {
    Ext.ux.state.SSWProvider.superclass.constructor.call(this);
    this.storage = window.ssw;
    this.state = this.storage.get();
  },

  // private
  set: function(name, value) {
    if(undefined === value || value === null){
      this.clear(name);
      return;
    }
    this.storage.add(name, value);
    Ext.ux.state.SSWProvider.superclass.set.call(this, name, value);
  },

  // private
  clear : function(name){
    if (0==arguments.length) {
      this.storage.clear();
    } else {
      this.storage.remove(name);
    }
    Ext.ux.state.SSWProvider.superclass.clear.call(this, name);
  }
});
