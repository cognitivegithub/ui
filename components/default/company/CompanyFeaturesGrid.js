/**
 * Компонент, который строит грид внутренних типов для организации
 * 2013/07/23 ptanya 3611 rel 41812 Кастомизация организации
 *
 * Евенты:
 *   custtypeselected(id, name) [IN]
 *     Задает организацию, для которой следует показывать/редактировать типы
 *     id: ид организации
 *     name: название организации
 *
 */

Ext.define('Application.components.companyFeaturesGrid', {
  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  contragentId: false,
  contragentName: false,
  stripeRows: true,
  initComponent: function() {
    var component = this;
    var columns;
    
    this.addEvents('custtypeselected');
    
    columns = [
        {header: '#', dataIndex: 'feature_id', width: 20, hidden: true, sortable: true}
    ];
    
    columns.push({header: 'Название', dataIndex: 'name', width: 60, sortable: true},
      {header: 'Описание', dataIndex: 'description', width: 100, sortable: true},
      {header: 'Активно', dataIndex: 'actual', xtype: 'checkcolumn', width: 20, sortable: true});
        
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: false,
      api: {
        read    : RPC.Company.featuresIndex,
        create  : RPC.Company.featuresUpdate,
        update  : RPC.Company.featuresUpdate
        //destroy : RPC.Company.featuresDelete
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'data',
      fields: ['id', 'feature_id', 'name','description', 'actual']
    });
    
    Ext.apply(this, {
      loadMask: true,
      //disabled: true,
      title: 'Найстройка особенностей организации',
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: columns,
      listeners: {
        custtypeselected: function(contragent_id, contragent_name) {
          component.contragentId = contragent_id;
          component.contragentName = contragent_name;
          //Ext.getCmp(role_panel_id).setText(role.data.name);
          store.setBaseParam('id', contragent_id);
          store.reload();
          component.enableEdit();
        },
        afterrender: function() {
          if (false!==component.contragentId) {
            component.enableEdit();
          }
        }
      },              
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
        if (component.contragentName !== undefined) {
          component.setTitle('Настройка особенностей организации "' + component.contragentName + '"');
          //Ext.getCmp(main_panel_id).setText(component.contragentName);
        } else {
          component.setTitle('Настройка особенностей организации');
        }
        //this.getTopToolbar().enable();
        this.getBottomToolbar().enable();
      }
    });
    Application.components.companyFeaturesGrid.superclass.initComponent.call(this);
  }
});