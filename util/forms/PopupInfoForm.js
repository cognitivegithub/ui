/**
 * Окно для вывода какой-либо информации пользователю
 *
 * Параметры:
 *   cmp_width — ширина окна (по умолчанию 500)
 *   cmp_html - текст сообщения в html формате
 */
 
Application.components.PopupInfoForm = Ext.extend(Ext.form.FormPanel, {

  initComponent : function () {
    var component = this;
    var cmp_width = component.cmp_width || 500;
    var cmp_html = component.cmp_html || '';
        
    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      bodyStyle: 'padding-right: 6px',
      width: cmp_width,
      frame: true,
      items: [
        {
          xtype: 'label',
          html: cmp_html
        }
      ],
      buttons: [{
        text: 'Закрыть',
        handler: function() {
          component.curWindow.close();
        },
        scope: this
      }]
    });
    
    Application.components.PopupInfoForm.superclass.initComponent.call(this);
            
  }
});
