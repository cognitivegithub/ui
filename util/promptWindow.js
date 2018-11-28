Ext.define('Application.components.promptWindow', {
  extend: 'Ext.Window',
  resizable: false,
  autoHeight: true,
  width: 450,
  initComponent: function() {
  
    this.items = [{
      xtype: this.cmpType,
      autoHeight: true
    }];
    
    if (this.cmpParams) {
      this.cmpParams.curWindow = this;
      Ext.apply(this.items[0], this.cmpParams);
    }
  
    Application.components.promptWindow.superclass.initComponent.call(this);
  }
});
