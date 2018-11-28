/**
 * Форма редактирования типов у организации
 * 2013/07/23 ptanya 3611 rel 41812 Кастомизация организации
 */
Ext.define('Application.components.companyFeaturesForm', {
  extend: 'Ext.Panel',  
  initComponent: function() {
    var component = this;
    var form_id = component.id;
    
    Ext.apply(this, {
      xtype: 'panel',
      border: false,
      frame: false,
      header: false,
      layout : 'form',
      title: 'Настройка организации',        
      bodyCssClass: 'subpanel-top-padding',
      items: [
      {
        xtype: 'Application.components.companyFeaturesGrid',
        listeners: {
          beforerender: function() {
            this.relayEvents(Ext.getCmp(form_id), ['custtypeselected']);
          }
        }
      }],
      listeners : {
        beforerender : function() {
          this.addEvents('custtypeselected');
        },
        afterrender: function() {
          performRPCCall(RPC.Company.load,[{id:component.cmpid}], null, function(resp){
            if(resp.success) {
              component.cmp_data = resp.data;
              component.fireEvent('custtypeselected', component.cmp_data.id, 
                                  component.cmp_data.full_name);
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    });
    Application.components.companyFeaturesForm.superclass.initComponent.call(this);
  }
});
