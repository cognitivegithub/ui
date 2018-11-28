
Ext.define('Application.components.CommissionForm', {
  extend: 'Ext.form.FieldSet',
  members_attended: null,
  member_roles: null,
  commissionStore: null,
  members_attended_cmp: null,
  commission_id_cmp: null,
  initComponent: function() {
    var component = this;
    component.members_attended_cmp = Ext.id();
    component.commission_id_cmp = Ext.id();
    this.commission_members = [];

    component.commissionStore = new Ext.data.JsonStore({
      idProperty: 'id',
      fields: [
        'id', 'commission_name'
      ]
    });

    component.addEvents('members_attended_loaded');

    function AddCommissionWindow(win_action) {
      var new_commission_name = Ext.id();
      var new_commission_name_val = '';

      var roles_store = new Ext.data.JsonStore({
        idProperty: 'id',
        fields: ['id', 'name']
      });
      roles_store.loadData(component.member_roles);

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

      var cm = new Ext.grid.ColumnModel({
        defaults: {
          sortable: true // columns are not sortable by default
        },
        columns: [{
          id: 'name',
          header: 'Фамилия Имя Отчество',
          dataIndex: 'name',
          editor: new Ext.form.TextField({
            name: 'user_name[]',
            emptyText: 'Фамилия Имя Отчество',
            allowBlank: false
          })
        }, {
          id: 'user_job',
          header: 'Должность',
          dataIndex: 'user_job',
          width: 150,
          hidden: !Main.config.commission_members_from_users
        }, {
          id: 'user_company',
          header: 'Организация',
          dataIndex: 'user_company',
          width: 250,
          hidden: !Main.config.commission_members_from_users
        }, {
          header: 'Роль',
          width: 200,
          dataIndex: 'role_name',
          renderer: displayTextLabelValue,
          editor: new Ext.form.ComboBox({
            store: roles_store,
            valueField: 'name',
            displayField: 'name',
            nameUI: 'userRole',
            hiddenName: 'user_role[]',
            listWidth: 180,
            editable: false,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            listClass: 'x-combo-list-small'
          })
        }, {
          header: "ИД пользователя",
          dataIndex: 'user_id',
          hidden: true
        }, {
          header: 'Операции',
          xtype: 'textactioncolumn',
          width: 20,
          items: [{
            icon: '/ico/delete.png',
            tooltip: 'Удалить',
            handler: function(grid, rowIndex) {
              grid.getStore().removeAt(rowIndex);
            }
          }]
        }]
      });

      var CommissionMember = Ext.data.Record.create([
          {name: 'id', mapping: 0},
          {name: 'name', mapping: 1},
          {name: 'role_name', mapping: 2},
          {name: 'role_id', mapping: 3},
          {name: 'user_id', mapping: 4},
          {name: 'user_company', mapping: 5},
          {name: 'user_job', mapping: 6}
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
        var name = (rec && rec.data && rec.data.user_fio ? rec.data.user_fio : '');
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
          name: name,
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
        var current_commission = component.commissionStore.getById(Ext.getCmp(component.commission_id_cmp).getValue());
        new_commission_name_val = current_commission.data.commission_name;
        var CommissionMembers = [];
        for(var i = 0; i<component.commission_members.length; i++) {
          CommissionMembers.push([
            component.commission_members[i].id,
            component.commission_members[i].name,
            component.commission_members[i].role,
            component.commission_members[i].role_id,
            component.commission_members[i].user_id,
            component.commission_members[i].user_company,
            component.commission_members[i].user_job
          ]);
        }
        store.loadData(CommissionMembers);
      }

      var grid = new Ext.grid.EditorGridPanel({
        store: store,
        cm: cm,
        autoExpandColumn: 'name', // column with this id will be expanded
        hideTitle: true,
        border: true,
        clicksToEdit: 1,
        height: 285,
        listeners: {
          beforeedit: function(e) {
            if(e.field=='name' && e.record.data.user_id) {
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
        }, {
          text: 'Добавить из пользователей',
          cls: 'x-btn-text-icon',
          icon: '/ico/roles.png',
          hidden: !Main.config.commission_members_from_users,
          handler: function() {

            var users_combo_id = Ext.id();
            var button_choose_id = Ext.id();

            var user_pickup = new Ext.Window({
              title: 'Выбрать пользователя',
              width: 500,
              autoHeight: true,
              layout: 'form',
              labelWidth: 200,
              modal: true,
              bodyStyle: 'padding: 10px',
              items: [{
                xtype: 'combo',
                hiddenName: 'company',
                fieldLabel: 'Организация',
                anchor: '100%',
                model: 'remote',
                store: createCompanyByType(),
                displayField: 'full_name',
                valueField: 'id',
                minChars: 3,
                hideTrigger: true,
                forceSelection: true,
                typeAhead: true,
                triggerAction: 'all',
                allowBlank: false,
                width: 150,
                listeners: {
                  select: function(combo, record) {
                    var users_combo = Ext.getCmp(users_combo_id);
                    users_combo.setValue('');
                    var users_store = users_combo.getStore();
                    users_store.setBaseParam('company_id', record.data.id);
                    users_store.load();
                  }
                }
              }, {
                xtype: 'combo',
                hiddenName: 'user',
                fieldLabel: 'Пользователь',
                id: users_combo_id,
                anchor: '100%',
                model: 'remote',
                store: createUsersShortStore(),
                displayField: 'user_fio',
                valueField: 'id',
                minChars: 3,
                hideTrigger: true,
                forceSelection: true,
                typeAhead: true,
                triggerAction: 'all',
                allowBlank: false,
                width: 150,
                listeners: {
                  select: function(combo, record) {
                    Ext.getCmp(button_choose_id).setDisabled(false);
                  }
                }
              }],
              buttons: [{
                text: 'Выбрать',
                id: button_choose_id,
                disabled: true,
                handler: function() {
                  var users_combo = Ext.getCmp(users_combo_id);
                  var users_combo_store = users_combo.getStore();
                  var rec = users_combo_store.getById(users_combo.getValue());

                  if (addNewMemberToGrid(rec)) {
                    // если добавление прошло успешно, закрываем окно выбора пользователя
                    user_pickup.close();
                  }
                }
              }, {
                text: 'Отменить',
                handler: function() {
                  user_pickup.close();
                }
              }]
            });
            user_pickup.show();
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
          fieldLabel: 'Наименование комиссии',
          id: new_commission_name,
          anchor: '100%',
          value: new_commission_name_val
        }, grid],
        buttons: [{
          text: 'Сохранить',
          handler: function(button) {
            var users = [];
            var commission_cmp = Ext.getCmp(component.commission_id_cmp);
            var error_occured = false;
            setTimeout(
              function() {
                grid.getStore().each(
                  function(record) {
                    if (!record.data.name) {
                      Ext.Msg.alert('Ошибка', 'Не указано имя одного из пользователей');
                      error_occured = true;
                      return;
                    }
                    if (!record.data.role_id) {
                      Ext.Msg.alert('Ошибка', 'Не указана роль у члена комиссии ' + record.data.name);
                      error_occured = true;
                      return;
                    }
                    users.push(record.data);
                  }
                );
                if (error_occured) return;
                var window = button.findParentByType('window');
                var commission_id = null;
                if (win_action == 'edit') {
                  commission_id = commission_cmp.getValue();
                }
                var commission_name = Ext.getCmp(new_commission_name).getValue();
                if (!commission_name) {
                  Ext.Msg.alert('Ошибка', 'Не указано название комиссии');
                  return;
                }

                performRPCCall(RPC.Applic.editCommission, [{'do': (!win_action ? 'add' : 'edit'), 'commission_name': commission_name, commission_id: commission_id, 'users': users}], {wait_text: 'Идет сохранение. Подождите...'}, function(resp){
                  if (resp.success) {
                    window.close();
                    var title = resp.success?'Успешно':'Ошибка';
                    var msg = resp.message||resp.msg;
                    if (!msg) {
                      msg = resp.success?'Документы и сведения направлены успешно':'Неизвестная ошибка';
                    }
                    var alert = Ext.MessageBox.alert(t(title), t(msg));
                    setTimeout(function () {
                      alert.hide();
                    }, 2000);
                    if (!win_action) {
                      var commission = component.commissionStore.recordType;
                      var p = new commission({
                        id: resp.commission_id,
                        commission_name: resp.commission_name
                      }, resp.commission_id);
                      component.commissionStore.add(p);
                      commission_cmp.setValue(resp.commission_id);
                    } else {
                      var current_commission = component.commissionStore.getById(commission_cmp.getValue());
                      current_commission.set('commission_name', resp.commission_name);
                      commission_cmp.setValue(current_commission.id);
                    }
                    commission_cmp.fireEvent('select');
                  } else {
                    echoResponseMessage(resp);
                  }
                });
              },
              500
            );

          }
        }, {
          text: 'Отменить',
          handler: function() {
            this.findParentByType('window').close();
          }
        }]
      });
    }

    function updateCommissionMembersAttended() {
      var panel = Ext.getCmp(component.members_attended_cmp);
      panel.removeAll();
      for(var i=0, n=component.commission_members.length; i<n; ++i) {
        var checked;
        if (Main.config.commission_in && !(component.commission_members[i].id in component.members_attended)) {
          checked = true;
        } else {
          checked = component.members_attended[component.commission_members[i].id];
        }

        panel.add({
          xtype: 'checkbox',
          checked: checked,
          id: 'member_attended_'+component.commission_members[i].id,
          name: 'member_attended['+component.commission_members[i].id+']',
          hideLabel: true,
          boxLabel: component.commission_members[i].name+' ('+component.commission_members[i].role+')',
          listeners: {
            check: function() {
              if (component.expander) {
                component.expander.collapseAll();
              }
            }
          }
        });
      }
      panel.doLayout();
    }

    Ext.apply(this, {
      cls: 'spaced-fieldset',
      defaults: {bodyStyle: 'padding: 0px'},
      items: [
      {
        layout: 'table',
        xtype: 'fieldset',
        cls: 'tpltbl x-panel-mc',
        defaults: {bodyStyle: 'padding: 0px'},
        layoutConfig: {
          columns: 2
        },
        items: [{
          cellCls: 'th',
          html: 'Комиссия:'
        }, {
          xtype: 'panel',
          colspan: 2,
          layout: 'fit',
          items: [{
            xtype: 'combo',
            hideLabel: true,
            editable: false,
            store: component.commissionStore,
            displayField:'commission_name',
            valueField: 'id',
            name: 'commission_id_combo',
            hiddenName: 'commission_id_value',
            id: component.commission_id_cmp,
            typeAhead: false,
            readOnly: !!component.commissionId,
            emptyText: 'Выберите',
            triggerAction: 'all',
            selectOnFocus:true,
            mode: 'local',
            listeners: {
              select: function() {
                if (this.getValue())
                performRPCCall(RPC.Reference.getCommissionMembers, [{commission_id: this.getValue()}], {wait_delay: 0, wait_text: 'Загружаются данные комиссии. Подождите...'}, function(resp) {
                  if (resp.success) {
                    component.commission_members = resp.commission_members;
                    updateCommissionMembersAttended();
                    if (component.expander) {
                      component.expander.expandAll();
                      component.expander.collapseAll();
                    }
                  } else {
                    echoResponseMessage(resp);
                  }
                });
              }
            }
          }, {
            layout: 'hbox',
            style: 'margin-top: 5px',
            hidden:(Main.config.hide_edit_comission!=undefined) ? (Main.config.hide_edit_comission):false,
            items: [{
              xtype: 'button',
              text: 'Добавить новую комиссию',
              style: 'padding-right: 10px;',
              hidden: !!component.commissionId,
              handler: function() {
                var win = AddCommissionWindow();
                win.show();
              }
            }, {
              xtype: 'button',
              hidden: !!component.commissionId,
              text: 'Редактировать комиссию',
              style: 'padding-right: 10px;',
              handler: function() {
                var commission_id = Ext.getCmp(component.commission_id_cmp).getValue();
                if (!commission_id) {
                  Ext.MessageBox.alert('Ошибка', 'Не выбрана комиссия.');
                  return;
                }
                var win = AddCommissionWindow('edit');
                win.show();
              }
            }, {
              xtype: 'button',
              id: 'remove_commission_button',
              hidden: !!component.commissionId,
              text: 'Удалить выбранную комиссию',
              handler: function() {
                var commission_cmp = Ext.getCmp(component.commission_id_cmp);
                if (!commission_cmp.getValue()) {
                  Ext.MessageBox.alert('Ошибка', 'Не выбрана комиссия.');
                  return;
                }
                performRPCCall(RPC.Applic.editCommission, [{'do': 'remove', commission_id: Ext.getCmp(component.commission_id_cmp).getValue()}], {wait_text: 'Идет удаление комиссии. Подождите...', confirm: 'Вы уверены что хотите удалить комиссию?'}, function(resp){
                  if (resp.success) {
                    echoResponseMessage(resp);
                    var commission = component.commissionStore.getById(commission_cmp.getValue());
                    component.commissionStore.remove(commission);
                    commission_cmp.reset();
                  } else {
                    echoResponseMessage(resp);
                  }
                });
              }
            }]
          }]
        }, {
          cellCls: 'th',
          html: 'Члены комиссии, присутствующие на заседании:'
        }, {
          id: component.members_attended_cmp,
          border: false
        }]
      }]
    });
    Application.components.CommissionForm.superclass.initComponent.call(this);
    this.on('applic_reviewlist_loaded', function(resp) {
      component.members_attended = resp.members_attended;
      component.member_roles = resp.member_roles;
      component.commissionStore.loadData(resp.commissions);
      var commissionCombo = Ext.getCmp(component.commission_id_cmp);
      if (resp.commission_selected) {
        commissionCombo.setValue(resp.commission_selected);
      }
      if (component.commissionId) {
        commissionCombo.setValue(component.commissionId);
      }
      commissionCombo.fireEvent('select');
    });
  },
  getCommissionMembers: function() {
    return this.commission_members;
  },
  getCommissionValue: function() {
    return Ext.getCmp(this.commission_id_cmp).getValue();
  },
  isCommissionSelected: function() {
    if (!this.getCommissionValue()) {
      Ext.MessageBox.alert('Ошибка', 'Вы не выбрали комиссию.');
      return false;
    }
    var is_any_attended = false;
    var panel = Ext.getCmp(this.members_attended_cmp);
    panel.items.each(function(val) {
      if (val.checked) {
        is_any_attended = true;
      }
    });
    if (!is_any_attended) {
      Ext.MessageBox.alert('Ошибка', 'Не выбран ни один из присутствующих членов комиссии.');
      return false;
    }
    return true;
  }
});
