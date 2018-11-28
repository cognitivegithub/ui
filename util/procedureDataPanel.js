/**
 * Компонент выводит панельку с информацией о процедуре.
 *
 * @param int procedure_id - идентификатор процедуры
 * @param bool procedureAutoLoad - автоматическая асинхронная загрузка данных о процедуре
 * 
 */

Ext.define('Application.components.procedureDataPanel', {
  extend: 'Ext.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    var panelId = Ext.id();
    this.addEvents('procedureloaded');
    Ext.apply(this, {
      labelWidth: 300,
      defaults: {
        anchor: '100%',
        defaults: {
          border: false,
          anchor: '100%',
          labelWidth: 300
        }
      },
      bodyCssClass: 'subpanel',
      items: [
        
      ],
      listeners:  {
        afterrender : function() {
          if (component.procedureAutoLoad && component.tplData===undefined) {
            RPC.Procedure.load(component.procedure_id, function(resp){
              component.fireEvent('procedureloaded', resp.procedure);
            });
          } else {
            component.fireEvent('procedureloaded', component.tplData);
          }
        },
        procedureloaded: function(procedure) {
          var dataPanel = {
            xtype: 'panel',
            id: panelId,
            tpl: getProcedureDataTemplate(),
            data: procedure
          };
          component.insert(0, dataPanel);
          component.doLayout();
        }
      }
    });
    Application.components.procedureDataPanel.superclass.initComponent.call(this);
  }
});
