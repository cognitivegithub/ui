/**
 * @class Application.components.procedureShortView
 * @extends Ext.panel.Panel
 */
Ext.define('Application.components.AdminReportsPanel', {
  extend: 'Ext.form.Panel',

  initComponent: function() {
    var component=this;
    var reportsStore = new Ext.data.ArrayStore({
      autoDestroy: false,
      storeId: 'reportStore',
      idIndex: 0,
      fields: [
        {name: 'name', type: 'string'},
        {name: 'title', type: 'string'}
      ],
      data: [
        ['supps_of_aucs', 'Поставщики, подавшие заявки на торги, отобранные по критериям']
      ]
    });

    Ext.apply(this, {
      title: 'Отчёты',
      url: '/admin/reports',
      frame: true,
      border: false,
      standardSubmit: true,
      width: 650,
      items: [{
        xtype: 'fieldset',
        autoHeight: true,
        title: '',
        layout: 'form',
        style: 'margin-top: 10px',
        defaults: {border: false, layout: 'form'},
        items: [
          {
            xtype: 'combo',
            fieldLabel: 'Выберите отчёт',
            store: reportsStore,
            valueField: 'name',
            id: 'report',
            displayField: 'title',
            name: 'report',
            typeAhead: false,
            emptyText: '',
            minChars: 3,
            hideTrigger: false,
            mode: 'local',
            width: 500,
            forceSelection: true,
            triggerAction: 'all',
            listeners: {
              select: function(s, r, i) {
                if (r.get('name')) {
                  Ext.getCmp('submit_id').setVisible(true);
                }

                Ext.getCmp('region_id').hide();
                Ext.getCmp('keywords_panel').hide();
                Ext.getCmp('zakname_panel').hide();
                Ext.getCmp('zakinn_panel').hide();
                Ext.getCmp('orgname_panel').hide();
                Ext.getCmp('orginn_panel').hide();
                Ext.getCmp('startpricefrom_panel').hide();
                Ext.getCmp('startpriceto_panel').hide();
                Ext.getCmp('list_panel').hide();
                Ext.getCmp('endregister_enddt').hide();
                Ext.getCmp('endregister_startdt').hide();

                switch (r.get('name')) {
                  case 'supps_of_aucs':
                    Ext.getCmp('list_panel').show();
                    Ext.getCmp('region_id').show();
                    Ext.getCmp('keywords_panel').show();
                    Ext.getCmp('zakname_panel').show();
                    Ext.getCmp('zakinn_panel').show();
                    Ext.getCmp('orgname_panel').show();
                    Ext.getCmp('orginn_panel').show();
                    Ext.getCmp('startpricefrom_panel').show();
                    Ext.getCmp('startpriceto_panel').show();
                    Ext.getCmp('endregister_enddt').show();
                    Ext.getCmp('endregister_startdt').show();
                    break;
                  default:
                    break;
                }
              }
            }
          }
        ]
      }, {
        xtype: 'fieldset',
        autoHeight: true,
        title: 'Параметры выбранного отчёта',
        layout: 'column',
        defaults: {border: false, layout: 'form'},
        items: [
          {
            columnWidth: 0.5,
            labelWidth: 130,
            items: [
              new Ext.form.DateField({
                hidden: true,
                name: 'endregister_startdt',
                id: 'endregister_startdt',
                format: 'd.m.Y',
                width: 170,
                fieldLabel: 'Дата окончания регистрации с'
              }),
              {
                xtype: 'combo',
                fieldLabel: 'Регион/область',
                store: createZonesStore('reg',{'sokr': true}),
                valueField: 'name',
                displayField: 'name',
                name: 'region_id',
                disabled: true,
                hidden: true,
                id: 'region_id',
                typeAhead: false,
                emptyText: '',
                minChars: 3,
                width: 170,
                hideTrigger: false,
                forceSelection: true,
                triggerAction: 'all'
              },{
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'startpricefrom',
                id: 'startpricefrom_panel',
                fieldLabel: 'Начальная цена с'
              },
              {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'zakname',
                id: 'zakname_panel',
                fieldLabel: 'Заказчик'
              },
              {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'zakinn',
                id: 'zakinn_panel',
                fieldLabel: 'ИНН заказчика'
              },
              {
                xtype: 'textarea',
                width: 170,
                hidden: true,
                name: 'list',
                id: 'list_panel',
                fieldLabel: 'Реестровые номера'
              }
            ]
          }, {
            columnWidth: 0.5,
            labelWidth: 130,
            items: [
              new Ext.form.DateField({
                width: 170,
                hidden: true,
                name: 'endregister_enddt',
                id: 'endregister_enddt',
                format: 'd.m.Y',
                fieldLabel: 'Дата окончания регистрации по'
              }),
              {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'keywords',
                id: 'keywords_panel',
                fieldLabel: 'Ключевые слова'
              },
              {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'startpriceto',
                id: 'startpriceto_panel',
                fieldLabel: 'Начальная цена до'
              }, {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'orgname',
                id: 'orgname_panel',
                fieldLabel: 'Организатор'
              },
              {
                xtype: 'textfield',
                width: 170,
                hidden: true,
                name: 'orginn',
                id: 'orginn_panel',
                fieldLabel: 'ИНН организатора'
              }
            ]
          }
        ]
      }, {
        type: 'panel',
        buttonAlign: 'left',
        buttons: [{
          text: 'Выгрузить',
          hidden: true,
          type: 'submit',
          id: 'submit_id',
          handler: function() {
            component.getForm().getEl().dom.action = '/admin/reports';
            component.getForm().getEl().dom.method = 'POST';
            component.getForm().getEl().dom.submit()
          }
        }]
      }]
    });

    Application.components.AdminReportsPanel.superclass.initComponent.call(this);
  }
});