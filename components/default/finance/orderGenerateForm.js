Ext.define('Application.components.orderGenerateForm', {
  extend: 'Ext.form.Panel',
  initComponent : function () {
    var component = this;
    this.addEvents('search_started');
    this.addEvents('applic_added');
    
    Ext.apply(this, {
      frame: false,
      border: false,
      autoHeight: true,
      labelWidth: 140,
      items:[
      {
        xtype:'dateinterval',
        cmp_id: 'date_added',
        fieldLabel: 'Заявки',
        anchor: '50%',
        labelWidth: 25
      }, {
        xtype: 'textfield',
        name: 'inn',
        fieldLabel: 'ИНН организации',
        anchor: '50%'
      }
      ],
      listeners : {
        search_started : function(generate_params) {
          component.parent.generateParams = generate_params;
        },
        applic_added: function() {
          component.reload_grid();
        }
      },
      buttons: [
        {
          text: 'Сгенерировать платежные поручения',
          handler: function(){
            component.reload_grid();
          }
        },
        {
          text: 'Отметить платежные поручения отданные в исполнение',
          handler: function(){
            var orderMarkPerformedId = Ext.id();
            var win = new Ext.Window({
              autoHeight: true,
              width: 600,
              closeAction: 'close',
              modal: true,
              title: 'Обработка платежных поручений',
              items: [{
                width: '100%',
                border: false,
                autoheight: true,
                frame: true,
                fileUpload: true,
                xtype: 'Application.components.orderMarkPerformedForm',
                id: orderMarkPerformedId,
                labelWidth: 150,
                close_fn: function() {
                  win.close();
                }
              }]
            });
            component.relayEvents(Ext.getCmp(orderMarkPerformedId), ['applic_added']);
            win.show();
          }
        }
      ],
      buttonAlign: 'left',
      reload_grid: function() {
        var values = {};
        collectComponentValues(component, values, false);
        component.fireEvent('search_started', values);
      }
    });
    Application.components.orderGenerateForm.superclass.initComponent.call(this);
  }
});
