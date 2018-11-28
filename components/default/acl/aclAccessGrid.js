/**
 * Компонент, который строит грид полномочий для роли
 *
 * Параметры:
 *   type: тип ресурсов для полномочий. Возможные значения: 'api', 'gui', 'menu'
 *
 * Евенты:
 *   roleselected(id, role) [IN]
 *     Задает роль, для которой следует показывать/редактировать полномочия
 *     id: ид роли
 *     role: record роли
 *
 */

Ext.define('Application.components.aclAccessGrid', {
  types: {
    api: 'api',
    gui: 'gui',
    menu: 'menu'
  },

  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  type: 'api',
  roleId: false,
  roleName: false,
  stripeRows: true,
  initComponent: function() {
    var component = this;

    var fields, api, columns, resources_store, displayField;
    var resources_combo_id = Ext.id();
    var role_panel_id = Ext.id();

    this.addEvents('roleselected');

    columns = [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true}
    ];

    switch (this.type) {
      case this.types.api:
      {
        resources_store = getApiResourcesStore();
        displayField = 'url';
        fields = ['id', 'module', 'controller', 'action', 'descr', 'access', 'mode'];
        api = {
          read: RPC.Acl.apiAclIndex,
          create: RPC.Acl.apiAclUpdate,
          update: RPC.Acl.apiAclUpdate,
          destroy: RPC.Acl.apiAclDelete
        };
        columns.push({header: 'Модуль', dataIndex: 'module', width: 60, sortable: true},
          {header: 'Контроллер', dataIndex: 'controller', width: 60, sortable: true},
          {header: 'Действие', dataIndex: 'action', width: 60, sortable: true});
        columns.push({header: 'Описание', dataIndex: 'descr', width: 100, sortable: true});
        break;
      }
      case this.types.gui:
      {
        resources_store = getGuiResourcesStore();
        displayField = 'url';
        fields = ['id', 'url', 'descr', 'access', 'mode'];
        api = {
          read    : RPC.Acl.guiAclIndex,
          create  : RPC.Acl.guiAclUpdate,
          update  : RPC.Acl.guiAclUpdate,
          destroy : RPC.Acl.guiAclDelete
        };
        columns.push({header: 'Адрес', dataIndex: 'url', width: 60, sortable: true});
        columns.push({header: 'Описание', dataIndex: 'descr', width: 100, sortable: true});
        break;
      }
      case this.types.menu: {
        resources_store = getMenuResourcesStore();
        displayField = 'menupath';
        fields = ['id', 'url', 'menupath', 'access', 'mode'];
        api = {
          read    : RPC.Acl.menuAclIndex,
          create  : RPC.Acl.menuAclUpdate,
          update  : RPC.Acl.menuAclUpdate,
          destroy : RPC.Acl.menuAclDelete
        };
        columns.push({header: 'Меню', dataIndex: 'menupath', width: 60, sortable: true});
        break;
      }
    }


    var modeEditor = new Ext.form.Checkbox({
    });

    columns.push({header: 'Тип', dataIndex: 'mode', width: 20, sortable: true,
      renderer: function(v) {return v?'Разрешение':'Запрет'},
      editor: modeEditor
    });
    columns.push({header: 'Операции', xtype: 'textactioncolumn', width: 20,
       items: [{
         icon: '/ico/delete.png',
         tooltip: 'Удалить',
         handler: function(grid, rowIndex) {
           grid.getStore().removeAt(rowIndex);
         }
       }]
    });

    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: false,
      api: api,
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'acls',
      fields: fields
    });

    Ext.apply(this, {
      loadMask: true,
      //disabled: true,
      title: 'Полномочия доступа к '+this.type.toUpperCase(),
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: columns,
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
        store: resources_store,
        triggerAction: 'all',
        forceSelection: true,
        minChars: 1,
        mode: 'local',
        valueField: 'id',
        displayField: displayField,
        id: resources_combo_id
      },{
        text: 'Добавить полномочие',
        handler: function(){
          var value = Ext.getCmp(resources_combo_id).getValue();
          if (store.findExact('id', value)>=0) {
            return;
          }
          value = resources_store.findExact('id', value);
          if (value<0) {
            return;
          }
          value = resources_store.getAt(value);
          value.data.mode = true;
          value = new store.recordType(value.data);
          store.insert(0, value);
          component.getView().scrollToTop();
        }
      }, '-', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          resources_store.reload();
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
