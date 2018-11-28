
Ext.define('Application.components.applicViewCnt', {
  extend: 'Ext.panel.Panel',

  initComponent: function() {
    var maincmp = this;

    Ext.apply(this, {

      title: 'Заявка на участие в процедуре',
      frame: true,
      border: false,
      defaults: {
        style: 'margin: 10px 15px'
      },
      procedureFieldList: {
        'registry_number'             : 'Номер процедуры:',
        'title'                       : 'Наименование процедуры:',
        'procedure_type_vocab'        : 'Форма торгов:',
        'org_full_name'               : 'Организатор:'
      },
      firstPartFields: {
        
      },
      secondPartFields:  {
        
      },
      items: [
        
      ]
    });


    this.on('load', function() {      
      var params = {
          mask: true,
          mask_el: this.getEl(),
          scope: this
        };

        performRPCCall(RPC.Applic.load, [this.application_id], params, function(resp) {
          if (resp && resp.success) {
            if (resp.applic) {
              var procedureDataFieldSet = {
                xtype: 'Application.components.keyValuePanel',
                fields: this.procedurefieldList
              };
              procedureDataFieldSet.loadData(resp.applic);
              this.items.push(procedureDataFieldSet);
              
              var procedureType = resp.applic.procedure.procedure_type;
              var stageNumber = resp.applic.procedure.application_stages;
              
              var firstPart = resp.applic.parts[0];
              var secondPart = null;
              if(stageNumber==2 && resp.applic.parts[1]) {
                secondPart = resp.applic.parts[1];
                var secondPartPanel = {
                  xtype: 'Application.components.keyValuePanel',
                  fields: this.secondPartFields
                };
              }
              if(stageNumber==1) {
                this.firstPartFields.full_name='Наименование заявителя';
                this.firstPartFields.legal_address='Юридический адрес: ';
                this.firstPartFields.postal_address='Почтовый адрес: ';
                this.firstPartFields.inn='ИНН: ';
                this.firstPartFields.phone='Контактный телефон: ';
                if(procedureType!=PROCEDURE_TYPE_AUC_ASC && procedureType!=PROCEDURE_TYPE_AUC_DESC) {
                  this.firstPartFields.price='Цена предложения: ';
                }
              }
              
              var firstPartPanel = {
                xtype: 'Application.components.keyValuePanel',
                fields: this.firstPartFields
              };
              firstPartPanel.loadData(firstPart);
              this.items.push(firstPartPanel);
              
              if(stageNumber==2 && resp.applic.parts[1]) {
                secondPartPanel.loadData(secondPart);
                this.items.push(secondPartPanel);
              }
            }
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });
    }, this);

    Application.components.applicViewCnt.superclass.initComponent.call(this);
  }
});
