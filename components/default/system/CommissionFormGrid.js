
Ext.define('Application.components.CommissionFormGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,

  commissionStore: null,
  commission_id: null,
  commission_members: null,
  initComponent : function () {
    var component = this;
    var property_form = Ext.id();

  var commis_store = new Ext.data.DirectStore({ //Хранилище для списка комиссий
      directFn: RPC.Applic.comissionlist,
      paramsAsHash: true,
      idProperty: 'id',
      root: 'rows',
      autoLoad: true,
      autoDestroy: true,
      fields: ['id', 'commission_name', 'fr_fio', 'fr_fio_id'],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: {
        customer_id: Main.user.contragent_id
      }
  });
  this.commission_members = [];
  component.commissionStore = commis_store;


  function AddCommissionWindow(win_action) {
      var new_commission_name = Ext.id();
      var new_commission_fr = Ext.id();
      var new_commission_name_val = '';
      var new_commission_fr_val = '';
      var new_commission_fr_id = '';

      var roles_store = new Ext.data.DirectStore({ //Стор для хранения списка ролей комиссий
        directFn: RPC.Applic.comissionlist,
        autoLoad: true,
        paramsAsHash: true,
        autoSave: true,
        root: 'roles',
        idProperty: 'id',
        fields: [
            'id', 'name' ],
        remoteSort: true
      });

      function displayTextLabelValue(val, params, record) {
          for(var i=0, len=roles_store.getCount(); i<len; ++i){
              var rec = roles_store.getAt(i);
              if (rec.data.name == val){
                  record.data.role_id = rec.data.id;
                  return rec.data.name;
              }
          }
          return val;
      }
      var existingMembers = [];
      var removedUsers = [];
      var cm = new Ext.grid.ColumnModel({
          defaults: {
              sortable: true // columns are not sortable by default
          },
          columns: [{
              id: 'member_fio',
              header: 'Фамилия Имя Отчество',
              dataIndex: 'member_fio',
              editor: {
                xtype: 'Application.components.commissionMemberNameField',
                allowBlank: false,
                storeValueField: 'member_fio',
                storeFields: ['user_job', 'department_name', 'user_phone'],
                removedUsers: [],
                listeners: {
                  beforerender: function(combo) {
                    combo.getStore().setBaseParam('existingMembers', existingMembers);
                    combo.getStore().setBaseParam('removedUsers', removedUsers);
                  },
                  beforeselect: function (combo, record) {
                    if (grid.getStore().query('user_id', record.get('id')).length > 0) {
                      return false;
                    }
                  },
                  select: function (combo, record) {
                    if (combo.gridEditor.record.get('id') != null) {
                      if (combo.gridEditor.record.get('user_id')) {
                        removedUsers.push(combo.gridEditor.record.get('user_id'));
                      }
                    }
                    grid.activeEditor.record.set('user_id', record.get('id'));
                    grid.activeEditor.record.set('user_job', record.get('user_job'));
                    grid.activeEditor.record.set('department_name', record.get('department_name'));
                    grid.activeEditor.record.set('user_phone', record.get('user_phone'));

                    var newUsers = [];

                    Ext.each(grid.getStore().getModifiedRecords(), function () {
                      if (this.get('user_id')) {
                        newUsers.push(this.get('user_id'));
                      }
                    });

                    combo.getStore().setBaseParam('newUsers', newUsers);
                    combo.getStore().setBaseParam('removedUsers', removedUsers);
                    combo.getStore().remove(record);

                  }
                }
              }
          }, {
              id: 'user_job',
              header: 'Должность',
              dataIndex: 'user_job',
              width: 150,
              hidden: !Main.config.commission_members_from_users
          }, {
              id: 'department_name',
              header: 'Подразделение',
              dataIndex: 'department_name',
              width: 250,
              hidden: !Main.config.commission_members_from_users
          },{
              header: 'Роль',
              width: 200,
              dataIndex: 'role_name',
              renderer: displayTextLabelValue,
              editor: new Ext.form.ComboBox({
                  store: roles_store,
                  valueField: 'name',
                  displayField: 'name',
                  hiddenName: 'user_role[]',
                  listWidth: 180,
                  editable: false,
                  triggerAction: 'all',
                  lazyRender: true,
                  mode: 'local',
                  listClass: 'x-combo-list-small'
              })
          }, {
              header: "Телефон",
              dataIndex: 'user_phone',
              hidden: true
          }, {
              header: 'Операции',
              xtype: 'textactioncolumn',
              width: 20,
              items: [{
                  icon: '/ico/delete.png',
                  tooltip: 'Удалить',
                  handler: function(grid, rowIndex) {
                      if (grid.getStore().getAt(rowIndex).get('user_id')) {
                        removedUsers.push(grid.getStore().getAt(rowIndex).get('user_id'));
                      }
                      grid.getStore().removeAt(rowIndex);
                  }
              }]
          }]
      });

      var CommissionMember = Ext.data.Record.create([
          {name: 'id', mapping: 0},
          {name: 'member_fio', mapping: 1},
          {name: 'role_name', mapping: 2},
          {name: 'role_id', mapping: 3},
          {name: 'user_id', mapping: 4},
          {name: 'department_id', mapping: 5},
          {name: 'department_name', mapping: 5},
          {name: 'user_phone', mapping: 6},
          {name: 'user_job', mapping: 7}
      ]);
      var myReader = new Ext.data.ArrayReader({
          id: 0
      }, CommissionMember);

      var store = new Ext.data.Store({
          autoDestroy: true,
          reader: myReader
      });

    function addNewMemberToGrid(rec) {
          // заполняем данные из записи
          var member_fio = (rec && rec.data && rec.data.user_fio ? rec.data.user_fio : '');
          var user_id = (rec && rec.data && rec.data.id ? rec.data.id : null);
          var user_company = (rec && rec.data && rec.data.user_company ? rec.data.user_company : '');
          var user_job = (rec && rec.data && rec.data.user_job ? rec.data.user_job : '');

          // если добавляется пользователь, проверяем был ли он уже добавлен
          if (user_id) {
              var is_already_added = false;
              grid.getStore().each(
                  function(record) {
                      if (user_id == record.data.user_id) {
                          is_already_added = true;
                          return false;
                      }
                  }
              );
              if (is_already_added) {
                  Ext.Msg.alert('Ошибка', 'Выбранный пользователь уже входит в состав комиссии.');
                  return false;
              }
          }

          // добавление записи в грид
          var CommissionMember = store.recordType;
          var p = new CommissionMember({
              member_fio: member_fio,
              role_name: '',
              role_id: '',
              user_id: user_id,
              user_company: user_company,
              user_job: user_job
          });
          grid.stopEditing();
          store.insert(store.getCount(), p);
          if (!user_id) {
              grid.startEditing(store.getCount()-1, 0);
          }
          return true;
      }

    if (win_action == 'edit') {
      performRPCCall(RPC.Reference.getCommissionMembers, [{commission_id: component.commission_id}], {wait_delay: 0, wait_text: 'Загружаются данные комиссии. Подождите...'}, function(resp) {
          if (resp.success) {
              component.commission_members = resp.commission_members;
              var CommissionMembers = [];
              for(var i = 0; i<component.commission_members.length; i++) {
                  existingMembers.push(component.commission_members[i].user_id);
                  CommissionMembers.push([
                      component.commission_members[i].id,
                      component.commission_members[i].name,
                      component.commission_members[i].role,
                      component.commission_members[i].role_id,
                      component.commission_members[i].user_id,
                      component.commission_members[i].department_id,
                      component.commission_members[i].department_name,
                      component.commission_members[i].user_phone,
                      component.commission_members[i].user_job
                  ]);
              }
              store.loadData(CommissionMembers);
          } else {
              echoResponseMessage(resp);
          }
      });
      var current_commission = component.commissionStore.getById(component.commission_id);
      new_commission_name_val = current_commission.data.commission_name;
      new_commission_fr_val =  current_commission.data.fr_fio;
      new_commission_fr_id =  current_commission.data.fr_fio_id;
    }

    var grid = new Ext.grid.EditorGridPanel({
      store: store,
      cm: cm,
      autoExpandColumn: 'member_fio', // column with this id will be expanded
      hideTitle: true,
      border: true,
      clicksToEdit: 1,
      height: 285,
      listeners: {
          beforeedit: function(e) {
              if(e.field=='member_fio' && e.record.data.user_id) {
                  return false;
              }
          }
      },
      tbar: [{
          text: 'Добавить члена комиссии',
          cls: 'x-btn-text-icon',
          icon: '/ico/add_user.png',
          handler : function(){
              addNewMemberToGrid();
          }
      }]
    });

    return new Ext.Window({
      title: (!win_action ? 'Добавить новую комиссию' : 'Редактирование комиссии'),
      width: 900,
      height: 400,
      layout: 'form',
      labelWidth: 200,
      bodyStyle: 'padding: 10px',
      items: [{
          xtype: 'textfield',
          fieldLabel: 'Наименование комиссии' + REQUIRED_FIELD,
          nameUI: "nameCommission",
          id: new_commission_name,
          anchor: '100%',
          allowBlank: false,
          value: new_commission_name_val
      }, {
        xtype: 'Application.components.frFioField',
        fieldLabel: 'Ответственный функциональный руководитель' + REQUIRED_FIELD,
        nameUI: "frFiOField",
        id: new_commission_fr,
        anchor: '100%',
        minChar: 1,
        allowBlank: false,
        value: new_commission_fr_val,
        listeners: {
          beforerender: function(combo) {
            combo.valueField = 'id';
          }
        }
      }, grid],
      buttons: [{
          text: 'Сохранить',
          handler: function() {
              var users = [];
              var error_occured = false;
              grid.getStore().each(
                  function(record) {
                      if (!record.data.member_fio) {
                          Ext.Msg.alert('Ошибка', 'Не указано имя одного из пользователей');
                          error_occured = true;
                          return;
                      }
                      if (!record.data.role_id) {
                          Ext.Msg.alert('Ошибка', 'Не указана роль у члена комиссии ' + record.data.member_fio);
                          error_occured = true;
                          return;
                      }
                      users.push(record.data);
                  }
              );
              if (error_occured) return;
              var window = this.findParentByType('window');
              var commission_id = null;
              if (win_action == 'edit') {
                  commission_id = component.commission_id;
              }
              var commission_fr = Ext.getCmp(new_commission_fr).selectedIndex < 0 ?
                new_commission_fr_id :
                Ext.getCmp(new_commission_fr).getValue();
              var commission_name = Ext.getCmp(new_commission_name).getValue();
              if (!commission_name) {
                  Ext.Msg.alert('Ошибка', 'Не указано название комиссии');
                  return;
              }
            if (!commission_fr) {
                  Ext.Msg.alert('Ошибка', 'Не указан ответственный функциональный руководитель');
                  return;
              }
              performRPCCall(RPC.Applic.editCommission, [{'do': (!win_action ? 'add' : 'edit'), 'commission_name': commission_name, 'fr_fio_id': commission_fr, commission_id: commission_id, 'users': users}], {wait_text: 'Идет сохранение. Подождите...'}, function(resp){
                  if (resp.success) {
                      window.close();
                      echoResponseMessage(resp);
                      if (!win_action) {
                          var commission = component.commissionStore.recordType;
                          var p = new commission({
                              id: resp.commission_id,
                              commission_name: resp.commission_name
                          }, resp.commission_id);
                          component.commissionStore.add(p);
                      } else {
                          var current_commission = component.commissionStore.getById(component.commission_id);
                          current_commission.set('commission_name', resp.commission_name);
                      }
                      component.commissionStore.reload();
                  } else {
                      echoResponseMessage(resp);
                  }
              });
          }
      }, {
          text: 'Отменить',
          handler: function() {
              this.findParentByType('window').close();
          }
      }]
    });
  }

  var grid1=new Ext.grid.ColumnModel({
          defaults: {
              sortable: true
          },
          columns: [
              {header: "Наименование комиссии", dataIndex: 'commission_name', tooltip: "Название профиля", sortable: true},
              {header: "Ответственный функциональный руководитель", dataIndex: 'fr_fio',  tooltip: "Ответственный функциональный руководитель", sortable: true},
              {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 50, items: [
                  {
                      tooltip: 'Редактировать',
                      icon: '/ico/edit.png',
                      handler: function(grid, rowIndex) {
                          var store = grid.getStore();
                          var record = store.getAt(rowIndex);
                          component.commission_id = record.id;
                          if (!component.commission_id) {
                              Ext.MessageBox.alert('Ошибка', 'Не выбрана комиссия.');
                              return;
                          }
                          var win = AddCommissionWindow('edit');
                          win.show();
                      }
                  },{
                      tooltip: 'Удалить',
                      icon: '/ico/delete.png',
                      handler:function(grid, rowIndex) {
                          var store = grid.getStore();
                          var record = store.getAt(rowIndex);
                          component.commission_id = record.id;
                          if (!component.commission_id) {
                              Ext.MessageBox.alert('Ошибка', 'Не выбрана комиссия.');
                              return;
                          }
                          performRPCCall(RPC.Applic.editCommission, [{'do': 'remove', commission_id: component.commission_id}], {wait_text: 'Идет удаление комиссии. Подождите...', confirm: 'Вы уверены что хотите удалить комиссию?'}, function(resp){
                              if (resp.success) {
                                  echoResponseMessage(resp);
                                  var commission = component.commissionStore.getById(component.commission_id);
                                  component.commissionStore.remove(commission);
                              } else {
                                  echoResponseMessage(resp);
                              }
                          });
                      }
                  }
              ]
              }
          ]
      });

    Ext.apply(this,
    {
      store: commis_store,
      colModel: grid1,
      viewConfig: {
        forceFit: true
      },
      tbar: [{
        text: 'Добавить комиссию',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
          handler: function() {
              var win = AddCommissionWindow();
              win.show();
          }
      }],
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.CommissionFormGrid.superclass.initComponent.call(this);
  }
});
