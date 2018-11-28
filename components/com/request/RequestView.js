/**
 * Компонент выводит форму рассмотрения заявки на регистрацию доверенности пользователя.
 *
 * Параметры:
 */

Ext.define('Application.components.RequestView', {
  extend: 'Ext.form.Panel',
  frame: true,
  cls: 'spaced-panel',
  fileUpload: true,
  initComponent: function() {
    var component = this;
    component.ids = new Array();
    component.ids.filePanelId = Ext.id();
    var procedure_info_panel = Ext.id();
    var request_info_panel = Ext.id();
    var storeComments = getRequestCommentsStore(component.request);
    storeComments.load();
    var status = 0;
    function loadRequestData() {
      performRPCCall(
        component.rpc_load_request,
        [{iLotId: component.lot,
          sType:component.rpc_load_request_type,
          iRequestId:component.request,
          iApplicationId:component.application_id}],
        {wait_delay: 0, wait_text: 'Загружаются сведения. Подождите...'},
        function(result) {
        if (result.success) {
          if (result.request && result.request.request_id !== null) {
            var requestData = result.request;
            status = requestData.status;
            if (result.files_request && result.files_request.length>0) {
              var files_request = [];
              for(var i=0, n=result.files_request.length; i<n; ++i)
                files_request.push((i+1)+') '+getFileDownloadTemplate().apply(result.files_request[i]['html'][0]));
              requestData = Ext.apply({request_docs: files_request.join('<br/>')}, requestData);
            }
            if (result.files_response && result.files_response.length>0 && requestData.status!=4) {
              var files_response = [];
              for(i=0, n=result.files_response.length; i<n; ++i)
                files_response.push((i+1)+') '+getFileDownloadTemplate().apply(result.files_response[i]['html'][0]));
              requestData = Ext.apply({response_docs: files_response.join('<br/>')}, requestData);
            }
            var request_info_panel_cmp = Ext.getCmp(request_info_panel);
            if (requestData.status == 2) {
              request_info_panel_cmp.setTitle('Текст запроса');
            } else if (requestData.status == 3) {
              request_info_panel_cmp.setTitle('Текст запроса и разъяснения');
            } else if (requestData.status == 4) {
              request_info_panel_cmp.setTitle('Текст запроса и причины отклонения');
            }
            Ext.getCmp(request_info_panel).update(getRequestInfoTemplate().apply(requestData));

          }
          var showComment = false;
          var button = {};
          if (status == 2) {
            button = Ext.getCmp('submit_iz');
            button.setVisible(true);
            showComment = true;
          } else if (status == REQUEST_STATUS_EDIT_IZ && !component.is_view) {
            button = Ext.getCmp('submit_riz');
            button.setVisible(true);
            var responseMessage = Ext.getCmp('response_fieldset_id');
            responseMessage.setVisible(true);
            Ext.getCmp('response_name_id').setValue(requestData.response_message);
            showComment = true;
            Ext.getCmp(request_info_panel).setVisible(false);
          } else if (status == REQUEST_EDIT_RIZ && !component.is_view) {
            button = Ext.getCmp('submit_gd_fr');
            button.setText('Направить ГД/ФР на утверждение внесения изменений<br> в действующую закупочную ' +
              'документацию<br> на основании поступившего запроса участника<br>');
            component.prepareBigButton(button);

            button.setVisible(true);
            Ext.getCmp('reject_iz').setVisible(true);
            Ext.getCmp('submit_ooz').setVisible(true);
            showComment = true;
          } else if (status == REQUEST_EDIT_GD && !component.is_view) {
            var rejectIzBtn = Ext.getCmp('reject_iz');
            component.prepareBigButton(rejectIzBtn);
            rejectIzBtn.setText('Отклонить внесение изменений в действующую закупочную<br>' +
              ' документацию на основании поступившего запроса участника');
            rejectIzBtn.setVisible(true);
            var submitOozBtn = Ext.getCmp('submit_ooz');
            submitOozBtn.setText('Утвердить внесение изменений в действующую закупочную<br> документацию на ' +
              'основании поступившего запроса участника');
            component.prepareBigButton(submitOozBtn);
            submitOozBtn.setVisible(true);
            showComment = true;
          }

          if (showComment) {
            var commentForm = Ext.getCmp('comments_fieldset_id');
            commentForm.setVisible(true);
          }
        } else {
          Ext.Msg.alert('Ошибка', result.message);
        }
      });
    }

    function changeStatus(data, titleOk) {
      var form = component.getForm();
      form.baseParams = {
        comment_name: null,
        response: null
      };
      form.titleOk = titleOk;
      Ext.apply(form.baseParams, data);

      if (form.isValid()) {
        performSave(component, null, 'reload', true);
      } else {
        Ext.Msg.alert('Ошибка', 'При направлении произошла ошибка!');
      }
    }

    Ext.apply(this, {
      frame: true,
      title: component.title,
      cls: 'spaced-panel',
      defaults: {
        xtype: 'fieldset',
        autoHeight: true
      },
      items: [{
        id: procedure_info_panel,
        title: 'Сведения о процедуре'
      }, {
        id: request_info_panel,
        title: 'Текст запроса и разъяснения'
      },
        {
          id: 'response_fieldset_id',
          title: component.textareaFieldTitle || 'Разъяснение',
          layout: 'form',
          labelWidth: 140,
          hidden: true,
          items: [{
            xtype: 'textarea',
            anchor: '100%',
            height: 150,
            id: 'response_name_id',
            name: 'response',
            fieldLabel: 'Текст разъяснения'+''+REQUIRED_FIELD
          }]
        }, {
        xtype: 'grid',
        title: 'Согласования',
        store: storeComments,
        autoHeight: true,
        colModel: new Ext.grid.ColumnModel({
          columns: [
            {
              header: 'Статус',
              dataIndex: 'type',
              renderer: function(value) {
                if (value == 'reject') {
                  return 'Отклонено';
                } else if (value == 'submit') {
                  return 'Направлено'
                }
                return 'Утверждено';
              }
            },
            {
              header: 'Комментарий',
              dataIndex: 'comment',
              renderer: function(value) {
                return value;
              }
            },
            {
              header: 'Сотрудник',
              renderer: function(value, obj, record) {
                return record.get('last_name') + ' ' + record.get('first_name') + ' ' + record.get('middle_name');
              }
            },
            {
              header: 'Дата',
              dataIndex: 'date',
              renderer: function(value) {
                return value;
              }
            }
          ]
        }),
        viewConfig: {
          forceFit: true
        }
      },
      {
        id: 'comments_fieldset_id',
        title: '',
        layout: 'form',
        labelWidth: 140,
        hidden: true,
        items: [{
          xtype: 'textarea',
          anchor: '100%',
          height: 150,
          id: 'comment_name_id',
          name: 'comment_name',

          fieldLabel: 'Комментарий'
        }]
      }],

      buttons: [
        {
          text: 'Назад',
          handler: function() {
            history.back(1);
          }
        },
        {
          id: 'submit_iz',
          text: 'Направить ИЗ',
          hidden: true,
          handler: function() {
            var data = {
              request_id: component.request,
              status_id: REQUEST_STATUS_EDIT_IZ,
              comment: Ext.getCmp('comment_name_id').getValue(),
              type: 'submit'
            };
            changeStatus(data, 'Направлено');
          }
        },
        {
          id: 'submit_riz',
          text: 'Направить Руководителю',
          hidden: true,
          handler: function() {
            var responseMsg = Ext.getCmp('response_name_id');
            if (!responseMsg.getValue()) {
              Ext.Msg.alert(
                'Ошибка валидации!',
                'Разъяснение не может быть пустым!'
              );
              return;
            }
            var data = {
              request_id: component.request,
              status_id: REQUEST_EDIT_RIZ,
              comment: Ext.getCmp('comment_name_id').getValue(),
              type: 'submit',
              request: responseMsg.getValue()
            };
            changeStatus(data, 'Направлено');
          }
        },
        {
          id: 'submit_iz',
          text: 'Направить ИЗ',
          hidden: true,
          handler: function() {
            var data = {
              request_id: component.request,
              status_id: REQUEST_STATUS_EDIT_IZ,
              comment: Ext.getCmp('comment_name_id').getValue(),
              type: 'submit'
            };
            changeStatus(data, 'Направлено');
          }
        },
        {
          id: 'submit_gd_fr',
          text: 'Направить ГД/ФР',
          hidden: true,
          handler: function() {
            var data = {
              request_id: component.request,
              status_id: REQUEST_EDIT_GD,
              comment: Ext.getCmp('comment_name_id').getValue(),
              type: 'accept'
            };
            changeStatus(data, 'Согласовано');
          }
        },
        {
          id: 'submit_ooz',
          text: 'Направить ООЗ',
          hidden: true,
          handler: function() {
            var data = {
              request_id: component.request,
              status_id: REQUEST_EDIT_OOZ,
              comment: Ext.getCmp('comment_name_id').getValue(),
              type: 'accept'
            };
            changeStatus(data, 'Согласовано');
          }
        },
        {
          id: 'reject_iz',
          text: 'Отклонить',
          hidden: true,
          handler: function() {
            var commentMsg = Ext.getCmp('comment_name_id').getValue();
            if (!commentMsg) {
              Ext.Msg.alert(
                'Ошибка валидации!',
                'Комментарий обязателен при отклонении!'
              );
              return;
            }
            var data = {
              request_id: component.request,
              status_id: REQUEST_STATUS_EDIT_IZ,
              comment: commentMsg,
              type: 'reject'
            };
            changeStatus(data, 'Отклонено');
          }
        }
      ],
      listeners: {
        afterrender: function() {
          var params = {
            mask: true,
            mask_el: this.getEl()
          };
          performRPCCall(RPC.Procedure.load, [component.procedure], params, function(resp) {
            if (resp && resp.success) {
              Ext.getCmp(procedure_info_panel).update(getProcedureDataTemplate().apply(resp.procedure));
              component.getForm().setValues(resp.procedure);
            } else if (resp) {
              echoResponseMessage(resp);
            }
          });
          loadRequestData();
          component.addFilesPanel();
        },
        reload: function (resp) {
          if (resp && resp.success) {
            var form = component.getForm();
            Ext.Msg.alert('Успешно', form.titleOk);
            component.doLayout();
            storeComments.reload();
            history.back(NO_MAGIC_NUMBER_ONE);
          } else {
            Ext.Msg.alert('Ошибка', 'При направлении произошла ошибка!');
          }
        }
      }
    });
    Application.components.RequestView.superclass.initComponent.call(this);
    this.form.api = {
      submit: component.submit_fn
    };
    this.form.waitMsgTarget = true;
  },
  addFilesPanel: function () {
    var component = this;
      var doc_panel = Ext.getCmp('response_fieldset_id');
      doc_panel.add({
        id: component.ids.filePanelId,
        border: false,
        hideTitle: true,
        items: [{
          xtype: 'Application.components.FilesPanel',
          file_panels: [{
            name: 'Документы',
            withDescr: false
          }],
          is_panel: true
        }]
      });
      doc_panel.doLayout();

    performRPCCall(component.rpc_load_request,
      [{iLotId: component.lot_id,
        sType:component.rpc_load_request_type,
        iRequestId:component.request,
        iApplicationId:component.application_id}],
      {wait_delay: 0, wait_text: 'Загружаются сведения. Подождите...'},
      function (result) {
        if (result.success) {
          if (result.request && result.request.request_id !== null) {
            var requestData = result.request;
            component.getForm().setValues(requestData);
            if (Main.config.procedure_coordination && component.request_type == 'response' && component.rpc_load_request_type == 'doc') {
              setComponentValues(Ext.getCmp(coordination_panel_id), requestData);
            }
            if (!component.disableFilePanel) {
              if (component.request_type == 'request') loadFilesIntoFilePanels(result.files_request, {deleteHandler: component.rpc_remove_request_file});
              else loadFilesIntoFilePanels(result.files_response, {deleteHandler: component.rpc_remove_request_file});
            }
          }
        } else {
          Ext.Msg.alert('Ошибка', result.message);
        }
      });
  },
  prepareBigButton: function (button) {
    var buttonTbody = button.el.first('tbody');
    if (buttonTbody && buttonTbody.replaceClass) {
      buttonTbody.replaceClass('x-btn-small', 'x-btn-large');
      buttonTbody.replaceClass('x-btn-icon-small-left', 'x-btn-icon-large-left');

      // Для кнопки, которая содержит три строки, если браузер не мозилла, добавляем дополнительные свойства.
      // Мозилла итак прекрасна.
      // Можно было конечно поставить проверку на браузеры с проблемой - Ext.isChrome, Ext.isIE, вероятно и на Оперу.
      // Можно конечно запоминать количество строк в кнопке и делать setHeight в зависимости от неё. Пока у нас самая
      // длинная кнопка в 3 строки, можно не писать лишнее.
      if (!Ext.isGecko && (button.getText().match(/<br>/g) || []).length == 3) {
        var buttonEm = button.el.child('.x-btn-mc em');
        if (buttonEm && buttonEm.setStyle) {
          buttonEm.setStyle('display', 'block');
          buttonEm.setStyle('overflow', 'hidden');
          buttonEm.setStyle('padding-bottom', '4px');
          button.setHeight(45);
        }
      }
    }
    return button;
  }
});
