Ext.define('Application.components.ExplainView', {
  extend: 'Ext.form.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;
    var request_info_panel = Ext.id();

    function loadRequestData() {
      var i, n;
      RPC.Procedure.loadExplain(component.lot, component.request, function(result) {
        if (result.success) {
          if (result.request && result.request.request_id !== null) {
            var requestData = result.request;
            if (result.files_response && result.files_response.length>0 && requestData.status!=4) {
              var files_response = [];
              for(i=0, n=result.files_response.length; i<n; ++i)
                files_response.push((i+1)+') '+getFileDownloadTemplate().apply(result.files_response[i]['html'][0]));
              requestData = Ext.apply({response_docs: files_response.join('<br/>')}, requestData);
            }
            Ext.getCmp(request_info_panel).update(getExplainInfoTemplate().apply(requestData));
            component.setTitle('Разъяснение документации к процедуре ' + result.request.procedure_registry_number + ', лот №' + result.request.lot_number);
          }
        } else {
          Ext.Msg.alert('Ошибка', result.message);
        }
      });
    }

    Ext.apply(this, {
      title: component.title,
      bodyCssClass: 'subpanel-top-padding',
      defaults: {
        xtype: 'fieldset',
        autoHeight: true
      },
      items: [{
        id: request_info_panel
      }],
      buttons: [{
        text: 'Назад',
        handler: function() {
          history.back(1);
        }
      }],
      listeners: {
        afterrender: function() {
          loadRequestData();
        }
      }
    });
    Application.components.ExplainView.superclass.initComponent.call(this);
  }
});