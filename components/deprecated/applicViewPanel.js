/**
 * Компонент выводит панельку с информацией о заявке.
 */

Ext.define('Application.components.applicViewPanel', {
  extend: 'Ext.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    
    Ext.apply(this, {
      labelWidth: 300,
      title: 'Заявка на участие в процедуре',
      frame: true,
      defaults: {
        anchor: '100%',
        defaults: {
          anchor: '100%'
        }
      },
      bodyCssClass: 'subpanel',
      items: [
        
      ], 
      listeners: {
        'beforerender': function() {
          var params = {
            mask: true,
            mask_el: this.getEl(),
            scope: this
          };

          performRPCCall(RPC.Applic.load, [component.application_id], params, function(resp) {
            if (resp && resp.success) {
              if (resp.applic) {
                var dataPanel = {
                  xtype: 'panel',
                  tpl: getApplicDataTemplate(resp.applic.parts.length),
                  data: resp.applic
                };
                component.add(dataPanel);
                component.doLayout();
              }
            } else if (resp) {
              echoResponseMessage(resp);
            }
          });
        }
      }
    });
    Application.components.applicViewPanel.superclass.initComponent.call(this);
  }
});
