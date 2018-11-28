
Application.components.CommonUserForm = Ext.extend(Ext.form.FieldSet, {
  fileUpload: true,
  autoLock: true,
  departmentSelectedId: null,
  initComponent : function () {
    var component = this;
    var action = component.act;
    var profile_locked = this.autoLock && Main && Main.contragent && Main.contragent.profile_locked && action!='register';
    var ro_class = profile_locked?'x-readonly':'';

    this.ids = this.ids||{};
    Ext.applyIf(this.ids, {
      login_username: Ext.id(),
      last_name: Ext.id(),
      first_name: Ext.id(),
      middle_name: Ext.id(),
      user_job: Ext.id(),
      user_email: Ext.id(),
      pass: Ext.id(),
      confpass: Ext.id(),
      secret_phraze: Ext.id()
    });

    if(action!='register') {
      component.hideLoginInfo=true;
    } else {
      component.hideLoginInfo=false;
    }

    Ext.apply(this, {
      autoHeight: true,
      width: 650,
      layout : 'form',
      title: 'Данные о пользователе',
      style: 'margin: 0px',
      labelWidth: 200,
      defaults: {
        anchor: '100%',
        stateful: true,
        //autoHeight: true,
        readOnly: profile_locked,
        cls: ro_class,
        itemsCssClass: ro_class,
        allowBlank: false,
        frame: true
      },
      items : [
        {
          xtype: 'textfield',
          name: 'last_name',
          id: component.ids.last_name,
          fieldLabel: 'Фамилия'+REQUIRED_FIELD,
          minLength: 2,
          maxLength: 100
        },
        {
          xtype: 'textfield',
          name: 'first_name',
          id: component.ids.first_name,
          fieldLabel: 'Имя'+REQUIRED_FIELD,
          minLength: 2,
          maxLength: 100
        },
        {
          xtype: 'textfield',
          name: 'middle_name',
          id: component.ids.middle_name,
          fieldLabel: 'Отчество'+REQUIRED_FIELD,
          minLength: 2,
          maxLength: 100
        },
        {
          ref: 'departmentId',
          xtype: 'combo',
          name: 'department_id',
          valueField: 'id',
          displayField: 'name',
          hiddenName: 'department_id',
          fieldLabel: 'Подразделение',
          mode: 'local',
          store: createDepartmentsStore({limit: 100}, {autoLoad:true}),
          editable: false,
          triggerAction: 'all',
          itemCls: 'required',
          allowBlank: false,
          listeners: {
            beforerender: function() {
              var store = this.getStore();
              store.on('load', function(){
                if (this.value) {
                  this.setValue(this.value);
                } else {
                  if (component.departmentSelectedId) {
                    // Проверяем существование подразделения
                    if (typeof store.getById(component.departmentSelectedId) == 'undefined') {
                      Ext.Msg.alert('Ошибка', 'Запрошенное подразделение не найдено.');
                      return false;
                    }
                    // Подставляем подразделение, для которого добавляем пользователя.
                    this.setValue(component.departmentSelectedId);
                  }
                }
              }, this, {single: true});
              this.setDisabled(!isAdmin());
            }
          }
        },
        {
          xtype: 'textfield',
          name: 'user_job',
          id: component.ids.user_job,
          fieldLabel: 'Должность',
          allowBlank: true,
          minLength: 2,
          maxLength: 255
        },
        {
          xtype: 'textfield',
          name: 'user_email',
          id: component.ids.user_email,
          vtype: 'email',
          fieldLabel: 'Адрес электронной почты'+REQUIRED_FIELD,
          blankText: 'Это поле должно содержать адрес электронной почты в формате "user@example.com". Ввод осуществляется в латинской раскладке клавиатуры.'
        },
        {
          xtype: 'textfield',
          name: 'user_external_email',
          id: component.ids.user_external_email,
          vtype: 'email',
          fieldLabel: 'Внешняя электронная почта' + REQUIRED_FIELD,
          blankText: 'Это поле должно содержать адрес электронной почты в формате "user@example.com". Ввод осуществляется в латинской раскладке клавиатуры.'
        },
        {
          xtype: 'Application.components.phonePanel',
          name: 'user_phone',
          fieldLabel: 'Телефон'+REQUIRED_FIELD
        },
        {
          xtype: 'superboxselect',
          name: 'roleIds',
          fieldLabel: 'Роли в системе'+REQUIRED_FIELD,
          required: true,
          flex: 1,
          allowBlank: false,
          msgTarget: 'under',
          allowAddNewData: true,
          allowQueryAll: true,
          emptyText: 'Выберите категории',
          resizable: true,
          store: component.getRolesStore(),
          mode: 'remote',
          displayField: 'name',
          valueField: 'id',
          queryDelay: 10,
          triggerAction: 'all',
          minChars: 4,
          ref: 'rolesSuperBox',
          valueDelimiter:';',
          listeners: {
            beforerender: function() {
              this.setDisabled(!isAdmin());
              if (component.departmentSelectedId == DEPARTMENT_MANAGEMENT && component.isFrAdd) {
                this.setValue(SYSTEM_USER_ROLE_FR_UNIT);
              }
            },
            'removeitem': function (boxselect) {
              component.rolesArr.setValue(boxselect.getValue());
            },
            'additem': function (boxselect) {
              component.rolesArr.setValue(boxselect.getValue());
            }
          }
        },
        // здесь храним и передаём права
        {xtype: 'hidden',
         ref: 'rolesArr',
         name: 'rolesArr'
        },
        {
          xtype: 'Application.components.timezoneCombo',
          name: 'timezone_combo',
          hidden: !Main.config.show_timezone,
          fieldLabel: 'Временная зона'+REQUIRED_FIELD
        },
        {
          xtype: 'textfield',
          name: 'username',
          id: component.ids.login_username,
          hidden: component.hideLoginInfo,
          disabled: component.hideLoginInfo,
          allowBlank: component.hideLoginInfo,
          fieldLabel: 'Логин (имя пользователя)'+REQUIRED_FIELD,
          minLength: 3,
          maxLength: 64
        },
        {
          fieldLabel : 'Пароль'+ (!component.hideLoginInfo ? REQUIRED_FIELD : ''),
          name: 'pass',
          xtype: 'textfield',
          //hidden: component.hideLoginInfo,
          //disabled: component.hideLoginInfo,
          allowBlank: component.hideLoginInfo,
          inputType: 'password',
          stateful: false,
          id: component.ids.pass,
          minLength: 5,
          maxLength: 100
        }, {
          fieldLabel : 'Повтор пароля'+ (!component.hideLoginInfo ? REQUIRED_FIELD : ''),
          name: 'confpass',
          xtype: 'textfield',
          //hidden: component.hideLoginInfo,
          //disabled: component.hideLoginInfo,
          allowBlank: component.hideLoginInfo,
          inputType: 'password',
          stateful: false,
          initialPasswordField: component.ids.pass,
          vtype: 'password',
          id: component.ids.confpass,
          minLength: 5,
          maxLength: 100
        },
        {
          xtype: 'textfield',
          name: 'secret_phraze',
          id: component.ids.secret_phraze,
          fieldLabel: 'Кодовая фраза для восстановления пароля'+REQUIRED_FIELD,
          minLength: 2,
          maxLength: 255,
          hidden: true,
          disabled: true
        },
        {
          xtype: 'hidden',
          name: 'id'
        }
      ]
    });

    Application.components.CommonUserForm.superclass.initComponent.call(this);
  },

  getRolesStore: function() {
    var component = this;

    return new Ext.data.DirectStore({
      autoDestroy: false,
      autoLoad: true,
      api: {
        read    : RPC.User.rightsIndex,
        create  : RPC.User.rightsUpdate,
        update  : RPC.User.rightsUpdate
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : false}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'roles',
      baseParams: {
        user_id: component.userId
      },
      fields: ['id', 'name', 'actual'],
      sortInfo: {
        field: 'name',
        direction: 'ASC'
      },
      listeners: {
        exception: storeExceptionHandler,
        'load': function() {
          component.rolesArr.setValue(component.rolesSuperBox.getValue());
        }
      }
    })
  }

});
