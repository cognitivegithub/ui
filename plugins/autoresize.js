/**
 * Плагин для автоматического изменения размеров компонента при изменении высоты окна браузера
 * Подключать через «plugins: Ext.ux.plugins.autoresize»
 *
 * Расчет высоты идет следующим образом:
 * autoResize.stickTo.height - autoResize.internalPanel.height - autoResize.guardHeight
 * Расчет ширины идет следующим образом:
 * autoResize.stickTo.width - autoResize.guardWidth
 *
 * Для подгона размера изменившегося компонента следует вызывать метод doLayout()
 *
 * Настройки (указываются в объекте-параметре autoResize компонента, к которому
 * подключается плагин):
 *
 *   autoWidth: подстраивать и ширину компонента (по умолчанию true, подстраивается
 *   и высота и ширина)
 *
 *   stickTo: ид компонента к которому привязывается размер. По умолчанию это
 *   панель контента лейаута
 *
 *   internalPanel: ид компонента, чей размер следует исключать из расчета
 *   высоты. По умолчанию это шапка контента лейаута. Если указать false то этот
 *   функционал будет отключен
 *
 *   guardHeight: дополнительный размер, на который следует уменьшать
 *   итоговую высоту. По умолчанию 0
 *
 *   guardWidth: дополнительный размер, на который следует уменьшать
 *   итоговую ширину. По умолчанию 0

 *
 * Евенты:
 *   Добавляет евент windowresize в компонент. Стреляет этот евент при ресайзе внешнего элемента,
 *   хендлер евента ресайзит компонент
 */

Ext.ns('Ext.ux.plugins');
Ext.ux.plugins.autoresize = {
  guardHeight: 0,
  guardWidth: 0,
  innerPanelId: 'layout_north_panel',
  outerPanelId: 'layout_center_outer_panel',
  init: function(cmp) {
    var self = Ext.ux.plugins.autoresize;
    cmp.autoResize = cmp.autoResize||{};
    Ext.apply(cmp.autoResize, {
      autoWidth: true
    });
    cmp.autoResize.delayEvent = null;
    var stickTo = Ext.getCmp(cmp.autoResize.stickTo||self.outerPanelId);
    var internalPanel = null;
    if (false !== cmp.autoResize.internalPanel) {
      internalPanel = Ext.getCmp(cmp.autoResize.internalPanel||self.innerPanelId);
    }
    var resizeEventStarter = function() {
      if (!cmp) {
        return;
      }
      if (cmp.autoResize.delayEvent) {
        clearTimeout(cmp.autoResize.delayEvent);
      }
      cmp.autoResize.delayEvent = setTimeout(function(){
        cmp.autoResize.delayEvent = null;
        if (cmp && cmp.fireEvent) {
          cmp.fireEvent('windowresize', cmp);
        }
      }, 100);
    }
    var calculateHeight = function() {
      var outer_height = stickTo.getHeight();
      var inner_height = internalPanel?internalPanel.getHeight():0;
      var guard_height = cmp?cmp.autoResize.guardHeight:undefined;
      if (undefined === guard_height) {
        guard_height = self.guardHeight;
      }
      return Math.floor(outer_height-inner_height-guard_height);
    }
    var calculateWidth = function() {
      var outer_width = stickTo.getWidth();
      var guard_width = cmp?cmp.autoResize.guardWidth:undefined;
      if (undefined === guard_width) {
        guard_width = self.guardWidth;
      }
      return Math.floor(outer_width-guard_width);
    }
    var resizeHandler = function () {
      if (!cmp) {
        return;
      }
      var new_height = calculateHeight();
      if (Math.floor(cmp.getHeight()) != new_height) {
        cmp.setHeight(new_height);
      }
      if (cmp.autoResize.autoWidth) {
        var new_width = calculateWidth();
        if (Math.floor(cmp.getWidth()) != new_width) {
          cmp.setWidth(new_width);
        }
      }
    }
    cmp.addEvents('windowresize');
    stickTo.on('resize', resizeEventStarter);
    cmp.on('resize', resizeEventStarter);
    //cmp.on('bodyresize', resizeEventStarter);
    cmp.on('render', resizeEventStarter);
    cmp.on('afterlayout', resizeEventStarter);
    cmp.on('windowresize', resizeHandler);
    cmp.on('destroy', function(cmp){
      if (cmp.autoResize.delayEvent) {
        clearTimeout(cmp.autoResize.delayEvent);
      }
      stickTo.un('resize', resizeEventStarter);
      cmp.un('windowresize', resizeHandler);
      cmp.un('afterlayout', resizeEventStarter);
      cmp.un('render', resizeEventStarter);
      cmp.un('resize', resizeEventStarter);
      //cmp.un('bodyresize', resizeEventStarter);
      cmp = null;
    });
    cmp.height = calculateHeight();
    if (cmp.autoResize.autoWidth) {
      cmp.width = calculateWidth();
    }
  }
}
