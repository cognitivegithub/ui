Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.UserController = Ext.extend(Application.controllers.Abstract, {
  title: 'Пользователи',
  moderationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: 'Список пользователей',
      cmpParams: {
        directFn: 'RPC.User.moderation',
        links: ['view', 'delete/restore', 'edit', 'rights', 'block/unblock']
      }
    });
  },
  addAction : function (params, app, panel) {
    var departmentId = params.department ? params.department : null;

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewNoedsUserForm',
      title: 'Регистрация нового пользователя',
      cmpParams: {
        act: 'register',
        type: 'user',
        departmentId: departmentId,
        api: RPC.Index.registerNoeds
      }
    });
  },
  addFrAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewNoedsUserForm',
      title: 'Регистрация нового функционального руководителя',
      cmpParams: {
        act: 'register',
        type: 'user',
        isAddFr: true,
        departmentId: DEPARTMENT_MANAGEMENT,
        isFrAdd: true,
        api: RPC.Index.registerNoeds
      }
    });
  },
  editAction : function (params, app, panel) {
    var departmentId = params.department ? params.department : null;
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.UserProfileForm',
      title: 'Редактирование профиля',
      cmpParams: {
        userId: (params.id) ? params.id : Main.user.id,
        draft: true,
        departmentId: departmentId,
        act: (params.act) ? params.act : 'edit'
      }
    });
  },
  accredAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.UserProfileForm',
      title: 'Заявка на перерегистрацию доверенности',
      cmpParams: {
        userId: Main.user.id,
        draft: true,
        act: (params.act) ? params.act : 'apply'
      }
    });
  },
  signAction : function (params, app, panel) {
    var additionalFields = [];
    var actionName = (params.act)?params.act:'apply';
    var backUrl = 'user/edit/act/'+actionName;
    if (actionName == 'edit') {
      backUrl = 'user/edit/id/'+params.user_id;
    }
    if (actionName == 'editFr') {
      backUrl = 'user/edit/id/' + params.user_id + '/act/' + params.act;
    }
    if (typeof(params.user_id) != 'undefined') {
      additionalFields.push({nm: "user_id", val: params.user_id});
    }
    actionName = actionName == 'editFr' ? 'edit' : actionName;

    additionalFields.push({nm: "do", val: actionName});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: backUrl,
        additional: additionalFields,
        api: RPC.User.sign,
        successMsgTitle: 'Сведения о пользователе успешно изменены',
        act: params.act
      },
      listeners: {
        afterrender : function() {
          RPC.User.signaturetext(params, function(provider, resp) {
            if(resp.result.success) {
              Ext.getCmp('signature_text').setValue(resp.result.message);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },

  viewAction : function (params, app, panel) {
    RPC.User.load(params.id||Main.user.id, (params.draft)?params.draft:false, function(result) {
      if (result.data.has_date_valid_for) {
        result.data.date_valid_for = Ext.util.Format.localDateOnlyRenderer(parseDate(result.data.date_valid_for, 'c'));
      }
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.UserProfile',
        cmpParams: {
          cmpdata: result.data,
          cmp_params: params
        }
      });
      panel.doLayout();
    });
  },

  listAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: 'Список пользователей',
      cmpParams: {
        directFn: 'RPC.User.list',
        links: ['view', 'review', 'rights', 'block/unblock', 'delete/restore', 'department'],
        params: {
          contragent_id: Main.user.contragent_id,
          with_accreditations: true
        }
      }
    });
  },

  rightsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.UserRights',
      cmpParams: {
        user_id: params.id
      }
    });
  },

  reviewAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.ReviewWarranty',
      accr_id: params.id,
      user_id: params.user_id,
      user_type: (params.user_type) ? params.user_type : 'user'
    });
  },

  accreditationsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserAccreditations',
      title: 'Список пользователей, подавших заявку на регистрацию'
    });
  },

  checkedsAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.CheckEdsPanel',
      title: 'Проверка ЭП пользователя',
      cmpParams: {
        user_id: params.user||Main.user.id
      }
    });
  },
  loadedsAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.LoadEdsForm',
      title: 'Обновление сертификата ЭП пользователя',
      cmpParams: {
        user_id: params.user||Main.user.id
      }
    });
  },
  changepassAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.CredentialsEditForm',
      title: 'Изменение авторизационных данных',
      cmpParams: {
        user_id: params.user||Main.user.id,
        type: 'password'
      }
    });
  },
  changeemailAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.CredentialsEditForm',
      title: 'Изменение авторизационных данных',
      cmpParams: {
        user_id: params.user||Main.user.id,
        type: 'email'
      }
    });
  },
  registerexpertAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RegisterExpertForm',
      title: 'Регистрация в качестве эксперта'
    });
  },
  expertslistAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ExpertGrid',
      title: 'Перечень экспертов'
    });
  },
  expertviewAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ExpertViewForm',
      title: 'Профиль эксперта',
      cmpParams: {
        expert_id: params.id
      }
    });
  },
  mcprofileAction : function (params, app, panel) {
		
//		RPC.User.listCategories(0, function(result) {
//			 console.log(result);
//    });
     RPC.User.load(params.id||Main.user.id, (params.draft)?params.draft:false, function(result) {
      if (result.data.has_date_valid_for) {
        result.data.date_valid_for = Ext.util.Format.localDateOnlyRenderer(parseDate(result.data.date_valid_for, 'c'));
      }
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.UserProfile_mc',
        cmpParams: {
          cmpdata: result.data,
          cmp_params: params
        }
      });
      panel.doLayout();
    });
  }
});
