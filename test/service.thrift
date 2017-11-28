struct SomeModel {
  1: optional i64 id;
  2: required string name;
}

service TestService {
  i32 doTest(1:i16 id, 2:string str);
  i32 doTest1(1:i64 id, 2:string str);
  string testModel(1:i64 id, 2:string str, 3:SomeModel model);
}