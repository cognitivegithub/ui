/**
 * @class Application.components.procedureShortView
 * @extends Ext.panel.Panel
 *
 * Просмотр извещения о проведении аукциона.
 *
 *
 */
Ext.define('Application.components.AdminStatisticsPanel', {
  extend: 'Ext.form.Panel',

  initComponent: function() {
    var component=this, statistics_cmp=Ext.id();
    var start_from_id = Ext.id(),
        start_till_id = Ext.id(),
        customer_inn_id = Ext.id(),
        customer_kpp_id = Ext.id();

    Ext.apply(this, {
      title: component.title,
      frame: true,
      border: false,
      width: 650,
      items: [{
			xtype: 'fieldset',
			autoHeight: true,
			title: 'Диапазон дат',
			layout: 'column',
			defaults: {border: false, layout: 'form'},
			items: [{
        columnWidth:0.5,
        labelWidth: 175,
        items: new Ext.form.DateField({
          name: 'start_from',
          id: start_from_id,
          format: 'd.m.Y',
          width: 120,
          fieldLabel: '<b>Дата расчета статистики с</b>'
        })
      }, {
        columnWidth:0.29,
        labelWidth: 25,
        items: new Ext.form.DateField({
          width: 120,
          name: 'start_till',
          id: start_till_id,
          format: 'd.m.Y',
          fieldLabel: '<b>по</b>'
        })
      }, {
        items: new Ext.Button({
          text: 'Пересчитать',
          handler: function() {
            performRPCCall(RPC.Admin.statistics, [Ext.apply(component.getForm().getValues(), {type: component.type})], {wait_message: 'Идет загрузка статистики. Подождите...'}, function(resp) {
              if (resp && resp.success) {
                if (component.type == 'common')
                  Ext.getCmp(statistics_cmp).update(getProceduresCommonStatisticsTemplate().apply(resp));
                else
                  Ext.getCmp(statistics_cmp).update(getProceduresStatisticsTemplate().apply(resp));
              } else {
                echoResponseMessage(resp);
              }
            })
          }
        })
      }]
      }, {
          xtype: 'fieldset',
          autoHeight: true,
          title: 'Дополнительные Фильтры',
          layout: 'column',
          defaults: {border: false, layout: 'form'},
          items: [{
            columnWidth:0.5,
            labelWidth: 100,
            items: new Ext.form.TextField({
              name: 'customer_inn',
              id: customer_inn_id,
              fieldLabel: '<b>ИНН заказчика</b>',
              allowBlank: true,
              vtype: (Main.config.validate_company_inn ? 'inn' : null),
              minLength: 10,
              maxLength: 12,
              minLengthText: 'Поле ИНН не может быть короче 10 знаков',
              maxLengthText: 'Поле ИНН не может быть длиннее 12 знаков',
              vtypeText: 'Поле ИНН заполнено некорректно'
            }) }, {
              columnWidth:0.5,
              labelWidth: 100,
              items: new Ext.form.TextField({
                name: 'customer_kpp',
                id: customer_kpp_id,
                fieldLabel: '<b>КПП заказчика</b>',
                allowBlank: true,
                vtype: 'digits',
                minLength: 9,
                maxLength: 9,
                minLengthText: 'Поле КПП не может быть короче 9 знаков',
                maxLengthText: 'Поле КПП не может быть длиннее 9 знаков',
                vtypeText: 'Поле КПП заполнено некорректно'
              }) }
          ]}, {
        id: statistics_cmp
      }, {
        type: 'panel',
        buttonAlign: 'left',
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

            var inn = Ext.getCmp(customer_inn_id).getValue();
            if (inn) {
              href += '/inn/' + inn;
            }
            var kpp = Ext.getCmp(customer_kpp_id).getValue();
            if (kpp) {
              href += '/kpp/' + kpp;
            }

            window.location = href;
          }
        }]
      }]
    });

    this.on('beforerender', function() {
      performRPCCall(RPC.Admin.statistics, [{type: component.type}], {wait_message: 'Идет загрузка статистики. Подождите...'}, function(resp) {
        if (resp && resp.success) {
          if (component.type == 'common')
            Ext.getCmp(statistics_cmp).update(getProceduresCommonStatisticsTemplate().apply(resp));
          else
            Ext.getCmp(statistics_cmp).update(getProceduresStatisticsTemplate().apply(resp));
        } else {
          echoResponseMessage(resp);
        }
      })
    }, this);

    Application.components.AdminStatisticsPanel.superclass.initComponent.call(this);
  }
});
