# Kiến thức lập trình cơ bản

## Lập trình là gì

Lập trình là quá trình viết các chỉ dẫn để máy tính thực hiện một nhiệm vụ cụ thể.

Một chương trình máy tính bao gồm nhiều câu lệnh được viết bằng ngôn ngữ lập trình.

Ví dụ:

- C
- C++
- Java
- Python

Lập trình giúp giải quyết các bài toán bằng cách sử dụng logic và thuật toán.

---

# Biến

Biến là vùng nhớ dùng để lưu trữ dữ liệu.

Ví dụ:

int age = 20;

Trong đó:

age là tên biến  
int là kiểu dữ liệu  
20 là giá trị

---

# Kiểu dữ liệu

Một số kiểu dữ liệu phổ biến:

int  
float  
double  
char  

Ví dụ:

int a = 5  
float price = 10.5

---

# Toán tử

Toán tử được dùng để thực hiện phép toán.

## Toán tử số học

+ cộng  
- trừ  
* nhân  
/ chia  
% chia dư  

Ví dụ:

int c = a + b

---

## Toán tử so sánh

== bằng  
!= khác  
> lớn hơn  
< nhỏ hơn  

Ví dụ:

if(a > b)

---

# Cấu trúc điều kiện

Cho phép chương trình đưa ra quyết định.

Ví dụ:

if(x > 0)
{
printf("so duong")
}
else
{
printf("so am")
}

---

# Vòng lặp

Vòng lặp cho phép lặp lại đoạn code.

## For loop

for(int i=0;i<10;i++)
{
printf("%d",i)
}

---

## While loop

while(i < 10)
{
i++
}

---

## Do while

do
{
i++
}
while(i<10)

---

# Mảng

Mảng là tập hợp các phần tử cùng kiểu.

Ví dụ:

int arr[5]

Truy cập phần tử:

arr[0]

---

# Hàm

Hàm là khối lệnh thực hiện một nhiệm vụ.

Ví dụ:

int add(int a,int b)
{
return a+b
}

---

# Con trỏ

Con trỏ là biến lưu địa chỉ bộ nhớ.

Ví dụ:

int a = 10  
int *p = &a

---

# Đệ quy

Đệ quy là khi hàm gọi lại chính nó.

Ví dụ:

int fact(int n)
{
if(n==0)
return 1

return n * fact(n-1)
}