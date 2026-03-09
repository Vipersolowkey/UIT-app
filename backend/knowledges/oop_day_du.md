# Lập trình hướng đối tượng

Lập trình hướng đối tượng là phương pháp tổ chức chương trình dựa trên đối tượng.

Các nguyên lý chính gồm:

- Encapsulation
- Inheritance
- Polymorphism
- Abstraction

---

# Class

Class là khuôn mẫu để tạo ra đối tượng.

Ví dụ:

class Student
{
int id
string name
}

---

# Object

Object là thể hiện của class.

Ví dụ:

Student s1

---

# Encapsulation

Encapsulation là nguyên lý đóng gói dữ liệu.

Các biến trong class thường được khai báo là private.

Ví dụ:

private:
int age

---

# Inheritance

Inheritance cho phép lớp con kế thừa lớp cha.

Ví dụ:

class Animal

class Dog : public Animal

---

# Polymorphism

Polymorphism cho phép một phương thức có nhiều dạng.

Ví dụ:

Method Overloading

Method Overriding

---

# Abstraction

Abstraction giúp ẩn chi tiết cài đặt.

Người dùng chỉ cần biết cách sử dụng.