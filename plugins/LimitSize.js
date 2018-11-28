
Ext.ns('Ext.ux.plugins');

/**
 * Плагин пытается делать так, чтобы окно не вылезало за пределы экрана.
 * Параметры (указывать у компонента, к которому цепляется плагин):
 * maxHeightFactor — коэффициент максимальной высоты окна относительно экрана (по умолчанию 0.9)
 * maxWidthFactor — коэффициент максимальной ширины окна относительно экрана (по умолчанию 0.95)
 * applyLayout — true для применения рекомендованных параметров (см. ниже)
 *
 * Для лучшего эффекта и корректной верстки желательно указывать у компонента:
 * layout: 'anchor',
 * frame: true,
 * cls: 'x-panel-mc', // для корректного функционирования frame
 * defaults: {
 *   anchor: '100%',
 *   border: false,
 *   autoHeight:true
 *   // cls: 'subpanel spaced-bottom', // для отступов у вложенных панелей (автоматически не ставится)
 * }
 */

Ext.ux.plugins.LimitSize = {
  init : function(component) {
    component.maxHeightFactor = component.maxHeightFactor||0.9;
    component.maxWidthFactor = component.maxWidthFactor||0.95;
    component.autoScroll = true;
    component.constrain = true;
    if (component.applyLayout) {
      Ext.apply(component, {
        layout: 'anchor',
        frame: true
      });
      component.cls = this.cls||'';
      component.cls += 'x-panel-mc';
      component.items.each(function(i){
        Ext.apply(i, {
          anchor: '100%',
          border: false,
          autoHeight:true
        });
      })
    }
    component.sizeLimiter = function() {
      var body = Ext.getBody();
      var maxheight = Math.floor(this.maxHeightFactor*body.getHeight());
      var maxwidth = Math.floor(this.maxWidthFactor*body.getWidth());
      var size = this.getSize();
      if (size.height>maxheight || size.width>maxwidth) {
        try {
          this.setSize(Math.min(size.width, maxwidth), Math.min(size.height, maxheight));
          this.doLayout();
        } catch (e) {
        }
      }
      if (this.syncShadow) {
        this.syncShadow();
      }
    }
    component.on('afterrender', component.sizeLimiter);
    component.on('resize', component.sizeLimiter);
  }
}

Ext.preg('LimitHeight', Ext.ux.plugins.LimitSize);
Ext.preg('LimitSize', Ext.ux.plugins.LimitSize);
