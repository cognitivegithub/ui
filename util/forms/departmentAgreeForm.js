/**
 * Форма для присваивания значений
 */
Application.components.DepartmentAgreeForm = Ext.extend(Ext.form.FormPanel, {
  /**
   * Инициализация.
   * @return {void}
   */
  initComponent : function () {
    /**
     * Отправка формы.
     * @param {object}    form       Форма.
     * @param {function}  success_fn Успех.
     * @returns {boolean} Возврат значения
     */
    function signForm(form, success_fn) {
      var formValues = form.getForm().getValues();
      var signatureValue = 'a';
      if (!checkSignatureResult(signatureValue)) {
        return false;
      }

      var onSuccess = function (resp) {
        resp.message = "Операция прошла успешно";
        echoResponseMessage(resp);
        success_fn();
      };
      formValues.signature = signatureValue;
      var params = {
        mask: true,
        wait_text: 'Присваивание...'
      };

      performRPCCall(form.api, [formValues], params, function(result) {
        onSuccess(result);
      });
      return true;
    }

    var component = this;
    var departments = component.departments;

    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      bodyStyle: 'padding-right: 6px',
      width: 600,
      frame: true,
      title: 'Выбор согласующего подразделения',
      items: [
        {
          xtype: 'combo',
          fieldLabel: 'Выбор согласующего подразделения',
          name: 'department_id',
          hiddenName: 'department_id',
          autoSelect: false,
          allowBlank: false,
          editable: false,
          triggerAction: 'all',
          typeAhead: true,
          isRequired: true,
          listWidth: 550,
          enableKeyEvents: true,
          mode: 'local',
          store: departments,
          value: component.depatment_id,
          autoWidth: true,
          width: 400
        },
        {
          xtype: 'hidden',
          name: 'old_department_id',
          value: component.depatment_id
        }
      ],
      buttons: [{
        text: 'Закрыть',
        handler: function() {
          component.success_fn();
        },
        scope: this
      }, {
        text: 'Назначить',
        scope: this,
        formBind : true,
        handler: function() {
          if (component.getForm().isValid()) {
            signForm(this, component.success_fn);
          } else {
            Ext.Msg.alert('Ошибка', 'Необходимо заполнить поле!');
          }

        }
      }]
    });

    Application.components.PopupInfoForm.superclass.initComponent.call(this);
    this.form.api = {
      submit: component.api
    };
  }
});
