/**
 * Компонент отображения капчи
 *
 * Параметры:
 *   стандартные для компонента, менять смысла нет
 *
 * Евенты:
 *   reload() [IN] перезагрузить изображение
 */

Application.components.captchaPanel = Ext.extend(Ext.Panel, {
  hideTitle: true,
  layout: 'table',
  layoutConfig: {columns: 2},
  border: false,
  //cls: 'registrationForm',
  captchaId: false,
  captchaUrl: '/index/captchaImage?captcha_id={0}&_dc={1}',
  captchaCodeId: undefined,
  captchaCodeName: 'captcha_id',
  codeValueId: undefined,
  codeValueName: 'captcha',
  initComponent: function() {
    var component = this;
    this.addEvents('reload');
    var waiting_img = '<img style="margin-top: 27px;" src="'+IMAGE_LOADING+'" />';
    Ext.apply(this, {
      autoHeight: true,
      defaults: {
        autoHeight: true,
        border: false
      },
      items: [
        {
          //cellCls: 'td1',
          style: 'text-align: center; width: 202px; margin: 0 auto;',
          items: [
            {
              height: 70,
              html: waiting_img
            }, {
              html: '<small>Если код нечитаем, кликните на его изображении левой кнопкой мыши.</small>'
            }
          ],
          listeners: {
            render: function() {
              this.addEvents('captchainit');
              this.addEvents('captchaclick');
              this.fireEvent('captchainit', this);
            },
            captchainit: function() {
              var cmp = this;
              RPC.Index.captcha(function(result) {
                if (component.isDestroyed || component.destroying) {
                  return;
                }
                if (result.success) {
                  component.captchaId = result.message;
                  component.getComponent(1).getComponent(1).setValue(component.captchaId);
                  cmp.getEl().on('click', function(){cmp.fireEvent('captchaclick', cmp);});
                  cmp.fireEvent('captchaclick', cmp);
                } else {
                  cmp.fireEvent.defer(5000, cmp, ['captchainit', cmp]);
                }
              });
            },
            captchaclick: function() {
              var ts = (new Date()).getTime();
              var imgurl = String.format(component.captchaUrl, component.captchaId, ts);
              var capimg = new Image();
              capimg.src = imgurl;
              var imgcmp = this.getComponent(0);
              imgcmp.update(waiting_img);
              capimg.onload = function() {
                imgcmp.update('<img src="'+imgurl+'"/>');
              };
            }
          }
        },
        {
          //cellCls: 'td2',
          layout: 'form',
          items: [
            {
              xtype: 'textfield',
              name: this.codeValueName,
              id: this.codeValueId,
              style: 'margin-top: 5px;',
              anchor: '100%',
              fieldLabel:'Введите код, указанный на картинке'+REQUIRED_FIELD,
              allowBlank: false,
              msgTarget: this.msgTarget,
              blankText: 'Поле обязательно для заполнения'
            },
            {
              xtype: 'textfield',
              name: this.captchaCodeName,
              id: this.captchaCodeId,
              inputType:'hidden',
              value: this.captchaId
            }
          ]
        }
      ]
    });
    Application.components.captchaPanel.superclass.initComponent.call(this);
    this.on('reload', function() {
      var cmp = this.getComponent(0);
      cmp.fireEvent('captchainit', cmp);
    });
  }
});
