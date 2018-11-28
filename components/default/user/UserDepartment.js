Ext.define('Application.components.UserDepartment', {
  extend: 'Ext.form.FieldSet',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var department_store = createDepartmentsStore({isActual: true, limit: false});
    var combo_dep_roles_id = Ext.id();

    Ext.apply(this, {
      border: false,
      frame: true,
      layout : 'form',
      style: 'padding-bottom: 0px; margin-bottom: 0px;',
      items: [{
        xtype: 'fieldset',
        defaults: {
          anchor: '100%'
        },
        items: [{
          xtype: 'combo',
          name: 'department_id',
          valueField: 'id',
          displayField: 'name',
          fieldLabel: 'Отдел',
          mode: 'local',
          store: department_store,
          editable: false,
          triggerAction: 'all',
          listeners: {
            select: function(combo, rec) {
              component.init_department_role_store(rec.data.name);
            }
          }
        }, {
          xtype: 'combo',
          name: 'department_role_id',
          id: combo_dep_roles_id,
          valueField: 'id',
          displayField: 'name',
          fieldLabel: 'Роль в отделе',
          mode: 'local',
          store: new Ext.data.ArrayStore({
                  fields: ['id', 'name'],
                  data: []
                }),
          editable: false,
          triggerAction: 'all'
        }]
      }],
      listeners: {
        afterrender: function() {
          performRPCCall(RPC.User.departmentload, [{user_id: component.user_id}], {wait_text: 'Загружаем данные...', mask: true}, function(result){
            if(result.success) {
              department_store.load({callback: function() {
                if (result.data.department_id) {
                  component.init_department_role_store(result.data.department_name);
                  setComponentValues(component, result.data);
                }
              }});
            } else {
              echoResponseMessage(result);
            }
          });
        }
      },
      init_department_role_store: function(dep_name) {
        var dep_roles = {
          1: 'Начальник',
          2: 'Главный специалист',
          3: 'Член комиссии',
          4: 'Сотрудник'
        };
        var store_data = [];
        for(var prop in dep_roles) {
          store_data.push([prop, dep_roles[prop]+' '+dep_name]);
        }
        var combo_dep_roles = Ext.getCmp(combo_dep_roles_id);
        var dep_roles_store = combo_dep_roles.getStore();
        dep_roles_store.removeAll();
        dep_roles_store.loadData(store_data);
      }
    });
    Application.components.UserDepartment.superclass.initComponent.call(this);
  }
});
