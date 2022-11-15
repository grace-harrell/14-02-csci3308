insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'camdavis', 'password', 1, '{0,0,0,0,0}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Jaden', 'password', 2, '{0,0,0,0,0}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'William', 'password', 1, '{2,3,1,1,3}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'George', 'password', 4, '{3,3,3,3,3}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Mike', 'password', 2, '{1,1,2,3,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Mia', 'password', 1, '{1,1,1,1,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Jack', 'password', 4, '{2,3,3,1,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Sam', 'password', 3, '{1,1,1,1,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Sasha', 'password', 1, '{2,2,1,1,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Alex', 'password', 1, '{2,1,3,1,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Roger', 'password', 2, '{3,2,1,2,3}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Michael', 'password', 1, '{2,3,2,1,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Tom', 'password', 3, '{2,2,3,1,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Morgan', 'password', 2, '{3,1,3,2,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Samantha', 'password', 1, '{2,3,2,1,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Claire', 'password', 2, '{2,1,1,1,3}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Ava', 'password', 4, '{3,3,3,3,3}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'John', 'password', 1, '{1,1,2,1,1}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Greg', 'password', 2, '{2,1,1,3,2}', 'i am a human being yes');
insert into users (is_admin, username, password, dorm_id, preferences, about_me) VALUES (False, 'Steven', 'password', 1, '{1,2,2,1,3}', 'i am a human being yes');

insert into user_to_messages (recipient_id, message_id) VALUES (1, 1);
insert into user_to_messages (recipient_id, message_id) VALUES (1, 2);
insert into user_to_messages (recipient_id, message_id) VALUES (1, 3);
insert into user_to_messages (recipient_id, message_id) VALUES (1, 4);
insert into user_to_messages (recipient_id, message_id) VALUES (2, 5);


insert into messages (message_id, sender_id, message) VALUES (1, 2, 'test 1');
insert into messages (message_id, sender_id, message) VALUES (2, 3, 'test 2');
insert into messages (message_id, sender_id, message) VALUES (3, 4, 'test 3');
insert into messages (message_id, sender_id, message) VALUES (4, 5, 'test 4');
insert into messages (message_id, sender_id, message) VALUES (5, 5, 'test 5');