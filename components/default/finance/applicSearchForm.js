Application.components.applicSearchForm = Ext.extend(Ext.form.FormPanel, {
  labelWidth: 140,
  frame:false,
  hideTitle: true,
  border: false,
  autoHeight: true,
  defaultType: 'textfield',
  style: 'margin: auto; padding: 0px; text-align: left;',
  initComponent : function () {
    var component = this;
    this.addEvents('search_started');
    
    Ext.apply(this, {
    items: [
      new Ext.form.FieldSet({
      title: 'Поиск заявок',
      autoHeight: true,
      defaultType: 'textfield',
      layout: 'column',
      defaults:{
        layout:'form',
        border:false,
        xtype:'panel'
      },
      items: [
      {
        labelWidth: 140,
        bodyStyle:'padding:1px 18px 0 0',
        columnWidth:0.4,
        items:[
        {
          xtype:'textfield',
          name: 'supplier_name',
          id: 'supplier_name',
          fieldLabel: '<b>Организация</b>',
          anchor: '100%',
          stateId: 'admin_docs_moneyback_supplier_name',
          stateEvents: ['change'],
          stateful: true,
          getState: function() {
            return {value:this.getValue()}
          }
        }, {
          xtype:'textfield',
          name: 'request_id',
          id: 'request_id',
          fieldLabel: '<b>Номер заявки</b>',
          anchor: '100%'
        }, {
          xtype:'textfield',
          name: 'supplier_inn',
          id: 'supplier_inn',
          fieldLabel: '<b>ИНН</b>',
          anchor: '100%',
          stateId: 'admin_docs_moneyback_supplier_inn',
          stateEvents: ['change'],
          stateful: true,
          getState: function() {
            return {value:this.getValue()}
          }
        }, {
          xtype:'textfield',
          name: 'supplier_kpp',
          id: 'supplier_kpp',
          fieldLabel: '<b>КПП</b>',
          anchor: '100%',
          stateId: 'admin_docs_moneyback_supplier_kpp',
          stateEvents: ['change'],
          stateful: true,
          getState: function() {
            return {value:this.getValue()}
          }
        }, {
          xtype: 'button',
          text: 'Искать',
          style: 'margin-top: 15px',
          type: 'submit',
          handler: function() {
            var values = {};
            collectComponentValues(component, values, true);
            component.fireEvent('search_started', values);
          }
        }]
      }, {
      columnWidth:0.6,
      items:[{
          layout: 'column',
          border: false,
          defaults: {
            layout: 'form',
            border: false,
            xtype:'panel'
          },
          items: [{
            columnWidth:0.45,
            items:[{
              xtype: 'datefield',
              anchor: '100%',
              name: 'start_from',
              id: 'start_from',
              format: 'd.m.Y',
              fieldLabel: '<b>Дата заявки с</b>',
              stateId: 'admin_docs_moneyback_start_from',
              stateEvents: ['change'],
              stateful: true,
              getState: function() {
                return {value:this.getValue()}
              }
            }]
          },{
            columnWidth:0.3,
            labelWidth: 35,
            items:[{
              xtype: 'datefield',
              anchor: '100%',
              name: 'start_till',
              id: 'start_till',
              format: 'd.m.Y',
              fieldLabel: '<b>по</b>',
              labelStyle: 'text-align: right;',
              stateId: 'admin_docs_moneyback_start_till',
              stateEvents: ['change'],
              stateful: true,
              getState: function() {
                return {value:this.getValue()}
              }
            }]
          }]
        }, {
          layout: 'column',
          border: false,
          defaults: {
            layout:'form',
            border:false,
            xtype:'panel'
          },
          items:[{
            columnWidth:0.45,
            items: [{
              xtype: 'textfield',
              anchor: '100%',
              style: 'margin-top: 2px',
              name: 'sum_min',
              id: 'sum_min',
              fieldLabel: '<b>Сумма на вывод от</b>',
              stateId: 'admin_docs_moneyback_sum_min',
              stateEvents: ['change'],
              stateful: true,
              getState: function() {
                return {value:this.getValue()}
              }
          }]
          }, {
            labelWidth: 35,
            columnWidth:0.3,
            items: [{
              xtype: 'textfield',
              anchor: '100%',
              style: 'margin-top: 2px',
              name: 'sum_max',
              id: 'sum_max',
              fieldLabel: '<b>до</b>',
              labelStyle: 'text-align: right;',
              stateId: 'admin_docs_moneyback_sum_max',
              stateEvents: ['change'],
              stateful: true,
              getState: function() {
                return {value:this.getValue()}
              }
              }]
            }]
          }, {
            xtype:'textfield',
            name: 'supplier_acct_lic',
            id: 'supplier_acct_lic',
            fieldLabel: '<b>Лицевой счет</b>',
            anchor: '100%',
            stateId: 'admin_docs_moneyback_supplier_acct_lic',
            stateEvents: ['change'],
            stateful: true,
            getState: function() {
              return {value:this.getValue()}
            }
          }]
		}
      ]
    })
    ],
    listeners : {
      search_started : function(search_params) {
        component.parent.searchParams = search_params;
      }
    }
  });
  
  Application.components.applicSearchForm.superclass.initComponent.call(this);
  }
});
