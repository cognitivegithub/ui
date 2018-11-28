
Ext.define('Application.components.rolesInheritance', {
  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  roleId: false,
  roleName: false,
  initComponent: function() {
    var component = this;

    var roles_combo_id = Ext.id();
    var role_panel_id = Ext.id();

    this.addEvents(['roleselected', 'inheritanceupdated']);

    var roles_store = getRolesStore();

    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: false,
      api: {
        read    : RPC.Acl.roleInheritanceIndex,
        create  : RPC.Acl.roleInheritanceUpdate,
        update  : RPC.Acl.roleInheritanceUpdate,
        destroy : RPC.Acl.roleInheritanceDelete
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      baseParams: {
        type: this.type
      },
      root: 'roles',
      fields: ['id', 'name', 'parent_role_id', 'child_role_id'],
      listeners: {
        save: function() {
          component.fireEvent('inheritanceupdated');
        }
      }
    });

    Ext.apply(this, {
      loadMask: true,
      //disabled: true,
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true},
        {header: 'Роль', dataIndex: 'name', width: 60, flex: 1, sortable: true},
        {header: 'Операции', xtype: 'textactioncolumn', width: 20,
           items: [{
             icon: '/ico/delete.png',
             tooltip: 'Удалить',
             handler: function(grid, rowIndex) {
               grid.getStore().removeAt(rowIndex);
             }
           }]
        }
      ],
      listeners: {
        roleselected: function(role_id, role) {
          component.roleId = role_id;
          component.roleName = role.data.name;
          //Ext.getCmp(role_panel_id).setText(role.data.name);
          store.setBaseParam('role_id', role_id);
          store.reload();
          component.enableEdit();
        },
        afterrender: function() {
          if (false!==component.roleId) {
            component.enableEdit();
          }
        }
      },
      tbar: {disabled: true, items:[{
        xtype: 'combo',
        store: roles_store,
        triggerAction: 'all',
        editable: false,
        forceSelection: true,
        minChars: 1,
        mode: 'local',
        valueField: 'id',
        displayField: 'name',
        width: 300,
        id: roles_combo_id
      },{
        text: 'Добавить роль',
        handler: function(){
          var value = Ext.getCmp(roles_combo_id).getValue();
          if (store.findExact(component.type+'_role_id', value)>=0) {
            return;
          }
          if (value==component.roleId) {
            return;
          }
          value = roles_store.findExact('id', value);
          if (value<0) {
            return;
          }
          value = roles_store.getAt(value);
          value = {
            name: value.data.name,
            parent_role_id: component.roleId,
            child_role_id: value.data.id
          };
          if ('parent'==component.type) {
            value.parent_role_id = value.child_role_id;
            value.child_role_id = component.roleId;
          }
          store.insert(0, new store.recordType(value));
          component.getView().scrollToTop();
        }
      }, '-', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          store.reload();
        }
      }, '->', {
        xtype: 'tbtext',
        cls: 'x-readonly',
        id: role_panel_id,
        html: '&nbsp'
      }]},
      bbar: {disabled: true, items:[{
        text: 'Сохранить',
        cls:'x-btn-text-icon',
        icon: 'ico/database_save.png',
        handler: function(){
          store.save();
        }
      }, {
        text: 'Отменить',
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        handler: function(){
          rejectStoreChanges(store);
        }
      }, '->', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          store.reload();
        }
      }]},
      enableEdit: function() {
        Ext.getCmp(role_panel_id).setText(this.roleName);
        this.getTopToolbar().enable();
        this.getBottomToolbar().enable();
      }
    });
    Application.components.aclAccessGrid.superclass.initComponent.call(this);
  }
});
