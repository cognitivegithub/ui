Ext.define('Application.components.timezoneCombo', {
  extend: 'Ext.form.ComboBox',
  initComponent: function() {
    var timezonesStore = getTimezonesStore();
    Ext.apply(this, {
      hiddenName: 'timezone',
      valueField: 'phptz',
      displayField: 'name',
      store: timezonesStore,
      value: 'Europe/Moscow',
      mode: 'local',
      typeAhead: true,
      minChars: 3,
      forceSelection: true,
      triggerAction: 'all',
      editable: true,
      selectOnFocus: false,
      listeners: {
        afterrender: function() {
          ensureStoreLoaded(timezonesStore, function(r) {
            if (!this.isDestroyed && !this.destroying) {
              this.setValue('Europe/Moscow');
            }
          }, this);
        }
      }
    });
    Application.components.timezoneCombo.superclass.initComponent.call(this);
  }
});
