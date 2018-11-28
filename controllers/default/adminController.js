Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.AdminController = Ext.extend(Application.controllers.Abstract, {
  title: 'Администрирование',
  aclAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.AclPanel',
      title: 'Права доступа'
    });
  },

  menueditAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.menuGrid',
      title: 'Редактирование меню'
    });
  },

  requirementsAction: function(params, app, panel)
  {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RequirementsGrid',
      title: 'Справочник требований к участникам',
      cmpParams: {
        directFn: 'RPC_po.Reference.getRequirementList',
        links: ['view', 'delete/restore', 'edit']
      }
    });
  },

  registerAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewUserAdminForm',
      title: 'Регистрация оператора системы',
      cmpParams: {
        act: 'register'
      }
    });
  },

  registercompuserAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewCompanyUserForm',
      title: 'Регистрация оператора системы',
      cmpParams: {
        act: 'register'
      }
    });
  },

  registerNoedsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewNoedsUserForm',
      title: 'Регистрация оператора системы без ЭП',
      cmpParams: {
        act: 'register',
        type: 'operator',
        api: RPC.Admin.registerNoeds
      }
    });
  },

  moderationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: 'Список операторов системы',
      cmpParams: {
        directFn: 'RPC.User.list',
        links: ['view', 'block/unblock', 'delete/restore', 'rights'],
        params: {
          contragent_id: Main.user.contragent_id,
          is_admin: true
        }
      }
    });
  },

  usersAction : function (params, app, panel) {
    var departmentId = params.department ? params.department : null;
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: 'Пользователи подразделений',
      cmpParams: {
        directFn: 'RPC.User.list',
        links: ['view', 'block/unblock', 'delete/restore', 'rights'],
        params: {
          contragent_id: null,
          all: true,
          is_admin: true,
          isDepartmentJoin: 1,
          department_id: departmentId,
          isRolesJoin: 1
        },
        listeners: {
          afterrender: {
            fn: function (grid) {
              grid.getBottomToolbar().add(
                {
                  xtype: 'tbseparator'
                },
                {
                  xtype: 'tbspacer'
                },
                {
                  text: 'Добавить пользователя',
                  xtype: 'button',
                  icon: '/ico/add_user.png',
                  handler: function (btn, evt) {
                    if (grid.isBlockedDepartmant) {
                      Ext.Msg.alert('Ошибка', 'Нельзя добавлять пользователей в заблокированное подразделение.');
                      return false;
                    }
                    if (null == departmentId) {
                      redirect_to('user/add');
                    } else {
                      redirect_to('user/add/department/' + departmentId);
                    }
                  }
                }
              );
              grid.getBottomToolbar().add(
                {
                  xtype: 'tbspacer'
                },
                {
                  text: 'Сбросить сессию',
                  xtype: 'button',
                  icon: '/ico/undo.png',
                  handler: function (btn, evt) {
                    
                    Ext.Msg.confirm('Подтверждение', 'Вы уверены что сбросить сессию для всех пользователей?', function(r) {
                      if ('yes'==r) {
                       // this.el.mask('Подождите...', 'x-mask-loading');
                        RPC.User.endsessionAll(function(result){
                         // this.el.unmask();
                          if (result.success) {
                            Ext.Msg.alert('Успешно', result.message||'Сессия успешно сброшена для всех пользователей');
                            redirect_to('auth/login');
                          } else {
                            Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                          }
                        });
                      }
                    });
                    
                   
                  }
                }
              );
              
            },
            single: true
          }
        }
      }
    });
  },

  frListAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserGrid',
      title: "Список функциональных руководителей",
      cmpParams: {
        directFn: 'RPC.User.list',
        links: ['view', 'block/unblock'],
        params: {
          contragent_id: null,
          all: true,
          isDepartmentJoin: 1,
          department_id: DEPARTMENT_MANAGEMENT,
          act: 'editFr'
        },
        listeners: {
          afterrender: {
            fn: function (grid) {
              grid.getBottomToolbar().add(
                {
                  xtype: 'tbseparator'
                },
                {
                  xtype: 'tbspacer'
                },
                {
                  text: 'Добавить ФР',
                  xtype: 'button',
                  icon: '/ico/add_user.png',
                  handler: function (btn, evt) {
                    redirect_to('user/addFr');
                  }
                }
              );

            },
            single: true
          }
        }
      }
    });
  },
  
    currencyAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.poCurrencyGrid',
      title: 'Курсы валют',
      cmpParams: {
        links: ['edit', 'delete/restore'],
        listeners: {
          afterrender: {
            fn: function (grid) {
              grid.getBottomToolbar().add(
                {xtype: 'tbfill'},
                {
                  text: 'Добавить курс',
                  ico: '/ico/add.png',
                  handler: function (btn, evt) {
                   redirect_to('admin/currencyEdit');
                  }
                }
              );
            },
            single: true
          }
        }
      }
    });
  },
  
  currencyEditAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.poCurrencyRateEditForm',
      title: 'Редактирование курса валют',
      cmpParams: {
        currencyRateId: (params.id) ? params.id : ''
      }
    });
  },

  accreditationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.UserAccreditations',
      title: 'Список пользователей, подавших заявку на регистрацию'
    });
  },

  editAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.AdminUserProfileForm',
      userId: (params.id)? params.id:Main.user.id,
      act: (params.act)?params.act:'apply',
      title: 'Профиль пользователя'
    });
  },

  sendnoticesAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SendNoticesForm'
    });
  },

  /**
   * Администрирование/Справочники/Обновление справочника БИК
   */
  vocabBiksAction : function (params, app, panel) {
    panel.add({
      xtype       : 'Application.components.actionPanel',
      cmpType     : 'Application.components.VocabBiksUpdateForm',
      title       : 'Обновление справочника БИК',
      cmpParams   : {
        title       : 'Обновление справочника БИК'
      }
    });
  },

  vocabDocsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.VocabDocumentsGrid'
    });
  },

  /**
   * Редактирование контента
   */
  contenteditAction : function (params, app, panel) {
    panel.add({
      xtype       : 'Application.components.fullscreenPanel',
      cmpType     : 'Application.components.AdminContentEdit',
      title       : 'Редактирование контента',
      header      : false,
      cmpParams   : {
        //part        : (params.part ? params.part : null),
        editable      : true
      }
    });
  },

  /**
   * Поиск по актам и счетам
   */
  searchdocsAction : function (params, app, panel) {
    panel.add({
      xtype       : 'Application.components.fullscreenPanel',
      frame       : true,
      cmpType     : 'Application.components.AdminSearchDocs',
      title       : 'Поиск документов'
    });
  },

  docvocabsAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.documentVocabsEdit',
      title: 'Тексты для требуемых документов'
    });
  },

  statisticsAction: function (params, app, panel) {
    var panelTitle;
    switch (params.type) {
      case '1':
        panelTitle = 'Статистика по аукционам на повышение';
        break;
      case '2':
        panelTitle = 'Статистика по аукционам на понижение';
        break;
      case '3':
        panelTitle = 'Статистика по конкурсам';
        break;
      case '4':
        panelTitle = 'Статистика по запросам предложений';
        break;
      case '5':
        panelTitle = 'Статистика по запросам котировок';
        break;
      case 'common':
        panelTitle = 'Общая статистика';
    }
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminStatisticsPanel',
      cmpParams: {
        type: params.type,
        title: panelTitle
      }
    })
  },

  /**
   * Администрирование/Контент/Требования к профилям
   */
  profilesAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.AdminProfilesTabPanel',
      title: 'Требования к профилям'
    });
  },

  profileDocsAction : function (params, app, panel) {
    RPC.Admin.listProfiles({profile_id: params.profile_id, type: params.type}, function(result) {
      panel.add({
        xtype: 'Application.components.fullscreenPanel',
        cmpType: 'Application.components.AdminProfilesDocsGrid',
        title: 'Обязательные документы профиля "' + result.rows[0]['name'] + '"',
        cmpParams: {
          profile_id: params.profile_id,
          profile_type: params.type
        }
      });
      panel.doLayout();
    });
  },

  procedureTypeSetupAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureTypeSetupGrid'
    });
  },

  cronAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminCronPanel',
      title: 'Системные кроны'
    });
  },
  configAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.EditConfigForm'

    }
  );
  },
  /**
   * Администрирование/Справочники/Упрощенный классификатор
   */
  vocabCategoriesAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.VocabCategoriesForm'
    });
  },
  /**
   * Договоры
   */
  contractsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: 'Договоры',
      cmpParams: {
        filter: params.type
      }
    });
  },
  /**
   * Оператор системы/Наименование оператора системы
   */
  etpinfoAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.EtpInfoForm',
      title: 'Наименование оператора системы'
    });
  },
  /**
   * Администрирование/Справочники/Смежные системы
   */
  etppeersAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.EtpPeersGrid',
      title: 'Смежные системы'
    });
  },

  /**
   * Администрирование/Справочники/Производственный календарь
   */
  holidaysAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.HolidaysGrid',
      title: 'Производственный календарь'
    });
  },

  sendmailAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminSendMail',
      title: 'Проверка почтовой системы'
    });
  },

  reportsAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminReportsPanel'
    });
  },

  vocabProcedureStepsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.VocabProcedureStepsGrid'
    });
  },

  smspReferenceAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.smspReferenceGrid',
      title: 'Управление справочником СМСП'
    });
  },

  budgetArticleDirectoriesAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.budgetArticleDirectories',
      title: 'Справочник статей бюджета'
    });
  },
    changeProcedureParamsAction: function (params, app, panel) {
        panel.add({
            xtype: 'Application.components.fullscreenPanel',
            cmpType: 'Application.components.changeProcedureParamsForm',
            title: 'Изменение параметров процедур'
        });
    },
  vatAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.vocabVat',
      title: 'Справочник НДС'
    });
  }
});
