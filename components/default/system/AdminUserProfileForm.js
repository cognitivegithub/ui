
Application.components.AdminUserProfileForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  fileUpload: true,
  initComponent : function () {
    var component = this;

    var action = (component.act) ? component.act : 'register';

    this.addEvents('reload');

    var fileFieldsetId = Ext.id();

    function loadUserData() {
      RPC.Reference.getUserRequirements(USER_PROFILE_WITH_EDS, function(files) {
          /*
          component.add({
            xtype: 'fieldset',
            frame: false,
            id: fileFieldsetId,
            title: 'Документы',
            items: [{
              xtype: 'Application.components.FilesPanel',
              file_panels: files.filePanels
            }]
          });
          */
          component.doLayout();
          RPC.User.load(component.userId, true, function(result) {
            if (result.success) {
              var userdata = result.data;
              component.getForm().setValues(userdata);
              loadFilesIntoFilePanels(result.data.user_files);
            } else {
              Ext.Msg.alert('Ошибка', 'Ваши данные не удалось загрузить.');
            }
          });
      });
    }

    Ext.apply(this, {
      autoHeight: true,
      width: 650,
      layout : 'form',
      title: component.title,
      labelWidth: 200,
      frame: true,
      defaults: {
        anchor: '100%',
        stateful: true,
        autoHeight: true,
        allowBlank: false,
        xtype: 'panel',
        frame: true,
        cls: 'spaced-panel',
        layout: 'form',
        stateEvents: ['change'],
        getState: function() {
          return {
            value: this.getValue()
          };
        },
        defaults: {
          anchor: '100%',
          msgTarget: 'under',
          allowBlank: false
        }
      },
      monitorValid : true,
      items : [{
        xtype: 'Application.components.CommonUserForm',
        act: action,
        listeners: {
          beforerender: function() {
            var component = this;
            if(component.act=='register') {
              var captcha = {
                xtype:'Application.components.captchaPanel',
                //id: 'capanel',
                labelWidth: 200
              };
              component.add(captcha);
            }
          }
        }
      }],
      buttons: [
      /*
      {
        text: 'Отмена',
        handler: function() {
          redirect_to('auth/login');
        }
      },
      */
      {
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function(){
          var form = this;
          if(this.getForm().isValid()) {
            performSave(form, null, 'reload');
          }
        }
      }/*,
      {
        text: 'Подписать и отправить',
        disabled: true,
        scope: this,
        formBind : true,
        handler: function() {
          var form = this;
          if(form.getForm().isValid()) {
            performSave(form, 'user/sign/act/'+form.act );
          }
        }
      }
      */
      ],
      listeners: {
        afterrender: function() {
           loadUserData();
        },
        reload : function() {
          //component.remove(Ext.getCmp(fileFieldsetId));
          fileFieldsetId = Ext.id();
          loadUserData();
        }
      }
    });
    Application.components.AdminUserProfileForm.superclass.initComponent.call(this);

    this.form.api = {
        submit: RPC.User.save
    };
    this.form.waitMsgTarget = true;
  }
});
