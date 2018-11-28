/**
 * Базовая панель для экшнов. Имеет фиксированную ширину и не ограниченную высоту
 *
 * Параметры:
 *   width — ширина (по умолчанию 800),
 *   title — тайтл компонента (он же отобразится в строке навигации и в заголовке
 *   браузера)
 *
 */
Ext.define('Application.components.actionPanel', {
  extend: 'Ext.panel.Panel',
  //width: '100%',
  style: 'padding-top: 20px',
  border: false,
  autoHeight: true,
  defaults: {
    width: 800,
    style: 'padding-bottom: 30px; margin-left: auto; margin-right: auto;'
  },
  initComponent: function() {
    var items = [{
      xtype: this.cmpType,
      title: this.title,
      autoHeight: true,
      outerPanel: this
    }];
    if (this.width) {
      items[0].width = this.width;
      delete this.width;
    }
    this.header = false;
    this.preventHeader = true;
    if (this.cmpParams) {
      Ext.apply(items[0], this.cmpParams);
    }
    if (this.forceHeader) {
      this.items = {
        xtype: 'panel',
        title: this.title,
        layout: 'fit',
        items: items
      }
    } else {
      this.items = items;
    }
    Application.components.actionPanel.superclass.initComponent.call(this);
  }
});
