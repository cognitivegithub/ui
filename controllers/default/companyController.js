Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.CompanyController = Ext.extend(Application.controllers.Abstract, {
  title: 'Организация',
  editAction : function (params, app, panel) {
    var isAvailable = true;

    /**
     * supplier_accreditations - Заявки на аккредитацию в качестве заявителя
     * customer_accreditations - Заявки на аккредитацию в качестве заказчиков
     */
    if( ( (Main.contragent.supplier_accreditations && Main.contragent.supplier_accreditations.length>0)  ||
         (Main.contragent.customer_accreditations && Main.contragent.customer_accreditations.length>0 ) )
       && Main.user.status<3) {
      isAvailable = false;
    }

    if (isAvailable &&
      !(isAdmin() || isUserPerfomerOOZUnit() || isUserDeputyHeadOOZ() || isUserHeadOOZ() || isGendir() || isFR()
        || isContragentsDirectory())
    ) {
      isAvailable = false;
    }

    if(isAvailable) {
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.NewContragentForm',
        cmpParams: {
          cmptype: (params.group)?params.group:null,
          profile_id: (params.profile)?params.profile:null,
          cmpid: params.id,
          act: (params.act)?params.act:'apply',
          customerAccreditationNotAllowed: !Main.config.customer_accreditation_allowed,
          active_tab: (params.tab)?params.tab:''
        }
      });
    } else {
        panel.add({
          xtype: 'Application.components.actionPanel',
          title: 'Доступ запрещен',
          cmpType: 'Application.components.nowayPanel',
          cmpParams: {
            html:'Вы не можете редактировать сведения о вашей организации, так как ваша доверенность на действия от ее лица еще не зарегистрирована и не принята администратором организации'
          }
        });
      }
  },

  addAction : function (params, app, panel) {
    var isAvailable = false;

    if (isAdmin() || isUserPerfomerOOZUnit() || isUserDeputyHeadOOZ() || isUserHeadOOZ() || isGendir() || isFR()
      || isContragentsDirectory()) {
      isAvailable = true;
    }

    if(isAvailable) {
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.NewContragentForm',
        cmpParams: {
          cmptype: (params.group)?params.group:null,
          profile_id: (params.profile)?params.profile:null,
          act: (params.act)?params.act:'apply',
          customerAccreditationNotAllowed: !Main.config.customer_accreditation_allowed,
          active_tab: (params.tab)?params.tab:''
        }
      });
    } else {
      panel.add({
        xtype: 'Application.components.actionPanel',
        title: 'Доступ запрещен',
        cmpType: 'Application.components.nowayPanel',
        cmpParams: {
          html:'Вы не можете редактировать сведения о вашей организации, так как ваша доверенность на действия от ее лица еще не зарегистрирована и не принята администратором организации'
        }
      });
    }
  },

  signAction : function (params, app, panel) {
    var actionName = (params.act)?params.act:'apply';
    var type = (params.supplier)? 'supplier' : ((params.customer) ? 'customer' : 'both');

    if(params.supplier && params.customer) {
      type = 'both';
    }
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureTabPanel',
      cmpParams: {
        backUrl: 'company/list',
        type : type,
        customer_profile_id : params.customer||null,
        supplier_profile_id : params.supplier||null,
        act: actionName,
        api: RPC.Company.sign
      }
    })
  },
  listAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.CompanyGrid',
      title: 'Поиск по организациям поставщиков',
      cmpParams: {
        storeParams: {
          showAll: true
        },
        drawOperations: ['Просмотреть','Редактировать', 'Удалить'],
        drawSearch: ['query','inn','kpp','ogrn','status','account'],
        drawColumns: ['id','account','full_name','inn','kpp','small_biz','drawOperations']
      }
    });
  },
  viewAction : function (params, app, panel) {
    //Если организация не имеет принятых аккредитаций, выводим ее из драфта
    if (!isCustomerAccred() && !isSupplierAccred() && !isAdmin()) {
      params.draft = 1;
    }
    var data = {
      id: params.id || Main.user.contragent_id,
      draft: params.draft||0,
      withProcuracyFiles: params.withProcuracyFiles || null,
      lot_id: Main.config.relative_participant_docs?(params.lot_id||null):null
    };
    RPC.Company.view(data, function(result) {
      if (result.success) {
        panel.add({
          xtype: 'Application.components.actionPanel',
          cmpType: 'Application.components.CompanyProfile',
          cmpParams: {
            cmpdata: result.cmp,
            datatime: result.data_time,
            lotdata: result.lot
          }
        });
        panel.doLayout();
      } else {
        Ext.Msg.alert('Ошибка', result.message);
        redirect_to('com/procedure/index');
      }
    });
  },
    viewShortAction : function (params, app, panel) {
        //Если организация не имеет принятых аккредитаций, выводим ее из драфта
//        if (!isCustomerAccred() && !isSupplierAccred() && !isAdmin()) {
//            params.draft = 1;
//        }
        var data = {
            id: params.id||Main.contragent.id,
            draft: params.draft||0,
            withProcuracyFiles: params.withProcuracyFiles || null,
            lot_id: Main.config.relative_participant_docs?(params.lot_id||null):null
        };
        RPC.Company.view(data, function(result) {
            if (result.success) {
                panel.add({
                    xtype: 'Application.components.actionPanel',
                    cmpType: 'Application.components.CompanyProfileShort',
                    cmpParams: {
                        cmpdata: result.cmp,
                        datatime: result.data_time,
                        lotdata: result.lot
                    }
                });
                panel.doLayout();
            } else {
                Ext.Msg.alert('Ошибка', result.message);
                redirect_to('com/procedure/index');
            }
        });
    },

  /* Просмотр контор в админке */
  profileAction : function (params, app, panel) {
    RPC.Company.view({id: params.id, draft: params.draft||0, withProcuracyFiles:1}, function(result) {
      if (result.success) {
        panel.add({
          xtype: 'Application.components.actionPanel',
          cmpType: 'Application.components.CompanyProfile',
          cmpParams: {
            cmpdata: result.cmp
          }
        });
        panel.doLayout();
      } else {
        Ext.Msg.alert('Ошибка', result.message);
        redirect_to('com/procedure/index');
      }
    });
  },
    profileShortAction : function (params, app, panel) {
        RPC.Company.view({id: params.id, draft: params.draft||0, withProcuracyFiles:1}, function(result) {
            if (result.success) {
                panel.add({
                    xtype: 'Application.components.actionPanel',
                    cmpType: 'Application.components.CompanyProfileShort',
                    cmpParams: {
                        cmpdata: result.cmp
                    }
                });
                panel.doLayout();
            } else {
                Ext.Msg.alert('Ошибка', result.message);
                redirect_to('com/procedure/index');
            }
        });
  },
  representationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RepresentationRightsForm'
    });
  },      
  representationsettingsAction : function (params, app, panel) {
    panel.add({
     xtype: 'Application.components.actionPanel',
     cmpType: 'Application.components.RepresentationSettingsForm',
     title: 'Настройки отображения процедур'
    });  
  },
  representationrightslistAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RepresentationRightsGrid',
      title: 'Реестр прав на публикацию процедур',
      cmpParams: {
        requests: false
      }
    });
  },
  representationrequestslistAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RepresentationRightsGrid',
      title: 'Заявки на регистрацию прав на публикацию процедур',
      cmpParams: {
        requests: true
      }
    });
  },
  representedrightslistAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RepresentedRightsGrid',
      title: 'Реестр прав на публикацию процедур',
      cmpParams: {
        requests: false
      }
    });
  },
  representedrequestslistAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RepresentedRightsGrid',
      title: 'Заявки на регистрацию прав на публикацию процедур',
      cmpParams: {
        requests: true
      }
    });
  },
  evadedsuppliersAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.EvadedSuppliersGrid',
      title: 'Список организаций-уклонистов'
    });
  },
  bannedAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.BannedContragentsGrid',
      title: 'Бан-лист организаций'
    });
  },
  expireAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ExpireContragentsGrid',
      title: 'Истечение аккредитаций'
    });
  },
  usersAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: 'Пользователи организации',
      cmpParams: {
        directFn: 'RPC.User.list',
        links: ['view', 'block/unblock'],
        params: {
          contragent_id: params.id,
          with_accreditations: true
        }
      }
    });
  },
  edsreapplyAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.edsReapplyForm',
      title: 'Переаккредитация из ЭП'
    })
  },
  addtosyncAction : function (params, app, panel) {
    RPC.Sync.addtosync({contragent_id: params.id}, function(result) {
      panel.add({
        xtype: 'Application.components.actionPanel',
        title: 'Синхронизация',
        cmpType: 'Application.components.nowayPanel',
        cmpParams: {
          html: result.success ? 'Контрагент добавлен в очередь' : 'Не найден контрагент'
        }
      });
      panel.doLayout();
    });
  },
  oosauthAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.OosAuthEditForm',
      title: 'Авторизационные данные в ЕИС',
      cmpParams: {
        company_id: params.contragent||Main.contragent.id
      }
    });
  },
  manualCreateAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.CompanyCreateForm',
      title: 'Создать организацию'
    });
  },
          
  //2013/07/23 ptanya 3611 rel 41812 Кастомизация организации
  featuresAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.companyFeaturesForm',
      title: 'Настройка организации',
      cmpParams: {
        cmpid: params.id
      }
    });
  }
});
