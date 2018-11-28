/**
 * Компонент выводит панельку с информацией о лоте.
 *
 * Параметры: shortInfo - укороченное представление (если не передано - будет полное
 */

var lotDataInitObject = {
  autoHeight: true,
  initComponent: function() {
    this.mode = ((this.shortInfo) ? 'withproc-short' : 'withproc');
    this.panel_id = Ext.id();
    this.addEvents('lotloaded');
    var cmp = this;

    Ext.apply(this, {
      title: 'Общие сведения о лоте',
      labelWidth: 300,
      style: 'margin-top: 10px; padding-bottom: 15px;',
      defaults: {
        anchor: '100%',
        defaults: {
          anchor: '100%'
        }
      },
      items: [
        {
          xtype: 'panel',
          autoHeight: true,
          id: this.panel_id
        }
      ],
      listeners : {
        lotloaded : function(data) {
          var lotFields = Application.models.Lot.getLotFields(data.procedure_type, cmp.mode, data);
          var lotTemplates = Application.models.Lot.getLotTemplates();
          var lotItems = Application.models.Lot.getLotPanelItems(data.lot, data, lotFields, lotTemplates, cmp.mode);
          var lotPanel = Ext.getCmp(cmp.panel_id);
          if (data.paper_form) {
            lotPanel.add({
                xtype: 'fieldset',
                hideTitle: true,
                style: 'margin: 5px; background-color: red;border: none; color: #fff',
                anchor: '100%',
                border: false,
                layout: 'anchor',
                html: "Процедура проводится не в электронной форме. Порядок подачи заявок указан в документации к процедуре."
            });
          }
          lotPanel.add(lotItems);
          lotPanel.doLayout();
        }
      }
    });
    Application.components.lotDataPanel.superclass.initComponent.call(this);
  }
};

Ext.define('Application.components.lotDataPanel', Ext.apply({extend: 'Ext.Panel'}, lotDataInitObject));
Ext.define('Application.components.lotDataFieldSet', Ext.apply({extend: 'Ext.form.FieldSet', bodyCssClass: 'subpanel'}, lotDataInitObject));