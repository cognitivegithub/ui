/**
 * Виджет профиля пользователя
 *
 * Параметры:
 *   нет
 *
 * Евенты:
 *   нет
 */
Application.components.UserinfoWidget = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var userinfowidget_panel_id = Ext.id();
    var userinfo_buttonpanel_id = Ext.id();
    var component = this;

    var userDataTemplate = '<table class="tpltbl">'+
            '<tr><td>Имя пользователя:</td><td>{full_name}</td></tr>'+
            '<tr><td>Должность:</td><td>{user_job}</td></tr>'+
            '<tr><td>Логин:</td><td>{login}</td></tr>'+
            '<tr><td>Email:</td><td>{user_email}</td></tr>'+
            '<tr><td>Сертификат выдан:</td><td>{certificate_issued}</td></tr>'+
            '<tr><td>Срок действия сертификата:</td><td>{certificate_valid}</td></tr>'+
            '<tr><td>Дата истечения аккредитации</td><td>{user_valid_for}</td></tr>'+
            '</table>';

    Ext.apply(this, {
      //height: 500,
      defaults: {
        border: false,
        autoHeight: false,
        defaults: {
          autoHeight: false,
          border: false
        }
      },
      frame: true,
      id: userinfowidget_panel_id,
      title: 'Профиль пользователя',
      items: [
        {
          xtype: 'panel',
          hideTitle: true,
          frame: false,
          tpl: userDataTemplate,
          data: Main.user
        },
        {
          xtype: 'panel',
          border: false,
          frame: false,
          header: false,
          autoHeight: true,
          layout: 'anchor',
          id: userinfo_buttonpanel_id,
          defaults: {
            style: 'padding: 3px; margin: 0px auto'
          },
          layoutConfig: {
            anchor: '95%'
          },
          items: [
            
          ]
        }
      ],
      listeners: {
        afterrender: function() {
          var user_appl= Main.user.user_accreditations.length;
          var active_appl = Main.user.user_accreditations[0];

          var button_cnt = Ext.getCmp(userinfo_buttonpanel_id);
          if(user_appl>0) {
            if(active_appl.status==STATUS_ADDED) {
              button_cnt.add({
                xtype: 'panel',
                html: 'Ваша заявка на регистрацию ожидает решения администратора'
              });
            } else if(active_appl.status==STATUS_ACCEPTED) {
              button_cnt.add(createSimpleRedirectButton('Редактировать данные пользователя','user/edit/act/edit'));
            }
          } else {
            button_cnt.add(createSimpleRedirectButton('Заявка на регистрацию доверенности','user/edit/act/apply'));
          }
          button_cnt.doLayout();
          
        }
      }
    });
    Application.components.UserinfoWidget.superclass.initComponent.call(this);
  }
});
