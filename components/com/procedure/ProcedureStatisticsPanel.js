/**
 * @class Application.components.ProcedureStatisticsPanel
 * @extends Ext.panel.Panel
 *
 * Статистика по процедурам заказчика
 *
 *
 */
Ext.define('Application.components.ProcedureStatisticsPanel', {
  extend: 'Ext.form.Panel',

  initComponent: function() {
    var component=this;
    var start_from_id = Ext.id(),
        start_till_id = Ext.id();

    Ext.apply(this, {
      title: component.title,
      frame: true,
      border: false,
      width: 500,
      bodyCssClass: 'subpanel-top-padding',
      bodyStyle: 'padding-top: 5px;',
      items: [{
        xtype: 'fieldset',
        autoHeight: true,
        title: 'Диапазон дат',
        layout: 'column',
        style: 'margin-bottom: 0px',
        defaults: {border: false, layout: 'form'},
        items: [{
          columnWidth:0.6,
          labelWidth: 115,
          items: new Ext.form.DateField({
            name: 'start_from',
            id: start_from_id,
            format: 'd.m.Y',
            width: 120,
            fieldLabel: '<b>Дата выгрузки с</b>'
          })
        }, {
          columnWidth:0.4,
          labelWidth: 25,
          items: new Ext.form.DateField({
            width: 120,
            name: 'start_till',
            id: start_till_id,
            format: 'd.m.Y',
            fieldLabel: '<b>по</b>'
          })
        }]
      }, {
        buttonAlign: 'right',
        style: 'padding-top: 4px',
        buttons: [{
          text: 'Выгрузить',
          handler: function() {
            var start_from_val = Ext.getCmp(start_from_id).getValue();
            if (start_from_val) {
              start_from_val = start_from_val.format('d.m.Y');
            }
            var start_till_val = Ext.getCmp(start_till_id).getValue();
            if (start_till_val) {
              start_till_val = start_till_val.format('d.m.Y');
            }
            var href = 'admin/downloadStatistics';
            if (start_from_val) {
              href += '/start_from/' + start_from_val;
            }
            if (start_till_val) {
              href += '/start_till/' + start_till_val;
            }
            window.location = href;
          }
        }]
      }]
    });

    Application.components.ProcedureStatisticsPanel.superclass.initComponent.call(this);
  }
});
