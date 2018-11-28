/**
 * Базовая панель для экшнов. Автоматически меняет размер под размер экрана
 * (активной области контента)
 *
 * Параметры:
 *
 *   title — заголовок окна компнента, отобразится и в строке навигации и в заголовке
 *   браузера)
 */
Ext.define('Application.components.fullscreenPanel',{
  extend: 'Ext.panel.Panel',
  frame: false,
  border: true,
  style: 'padding: 15px;',
  plugins: Ext.ux.plugins.autoresize,
  initComponent: function() {
    this.items = [{
      xtype: this.cmpType,
      border: true,
      frame: false,
      title: false,
      outerPanel: this
      //title: this.title
    }];
    this.layout = 'fit';
    //this.title = false;
    if (this.cmpParams) {
      Ext.apply(this.items[0], this.cmpParams);
    }
    if (this.cmpEvents && this.cmpEvents.length) {
      this.addEvents(this.cmpEvents);
      this.on('render', function() {
        this.getComponent(0).relayEvents(this, this.cmpEvents);
      }, this, {once: true});
    }
    Application.components.actionPanel.superclass.initComponent.call(this);
  }
});
