Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.RequirementsController = Ext.extend(Application.controllers.Abstract, {
  title: 'Редактирование требования',
  editAction: function (params, app, panel) {
    performRPCCall(RPC.Requirements.loadItem, [{id: params.id}], {}, function(resp) {
      if (resp && resp.success) {
        var item = resp.item;
        panel.add({
          xtype: 'Application.components.actionPanel',
          cmpType: 'Application.components.RequirementForm',
          width: 950,
          forceHeader: true,
          stageParam: false,
          cmpParams: {
            itemName: item.name,
            itemId: item.id,
            itemCode: item.code,
            itemActual: item.actual,
            requirements: item.requirements,
            api: RPC.Requirements.edit,
            success_fn: function() {
              panel.doLayout();
            }
          }
        });
        panel.doLayout();
      } else {
        Ext.MessageBox.alert('Ошибка', resp.message.join('</br>'));
      }
    });
  },
  addAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequirementForm',
      width: 950,
      forceHeader: true,
      stageParam: false,
      cmpParams: {
        itemActual: true,
        requirements: [],
        api: RPC.Requirements.create,
        success_fn: function() {
          var store = createRequirementsStorage();
          store.reload();
          redirect_to('admin/requirements');
        }
      }
    });
  }
});