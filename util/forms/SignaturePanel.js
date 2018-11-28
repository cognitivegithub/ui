/**
 * Текстовое поле для подписи. Позволяет подписать заданный текст ЭП.
 */

Application.components.SignaturePanel = Ext.extend(Ext.Panel, {
  frame : true,
  border : false,
  autoHeight: true,
  initComponent : function () {
    var component = this;

    Ext.apply(this, {
      labelAlign: 'top',
      autoScroll: true,
      layout: 'form',
      defaults: {
        anchor : '100%'
      },
      items : [
        {
          xtype: 'fieldset',
          cls: 'shallowsubpanel',
          layout: 'form',
          style: 'margin: 10px',
          defaults: {
            anchor: '100%'
          },
          title: t('Внимательно перечитайте и проверьте подписываемые данные'),
          items: [
            {
              xtype: 'textarea',
              style: 'margin: 5px',
              name: component.cmptype+'_signature_text',
              hideLabel: true,
              id: component.cmptype+'_signature_text',
              height: 600,
              readOnly: true
            }
          ]
        }
      ],
      getValues : function() {
        var v = {};
        collectComponentValues(this, v, true);
        return v;
      }
    }
    );
    Application.components.SignaturePanel.superclass.initComponent.call(this);

  }
});
