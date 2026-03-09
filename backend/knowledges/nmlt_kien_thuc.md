# Kiến thức Nhập môn lập trình

Nhập môn lập trình là môn học nền tảng giúp sinh viên hiểu cách máy tính thực thi chương trình.

---

# Biến (Variables)

Biến là vùng nhớ dùng để lưu trữ dữ liệu trong chương trình.

Ví dụ:

int age = 20;

Ở đây:

age là tên biến  
int là kiểu dữ liệu  
20 là giá trị

---

# Kiểu dữ liệu

Một số kiểu dữ liệu phổ biến:

int – số nguyên  
float – số thực  
char – ký tự  
double – số thực độ chính xác cao

---

# Toán tử

Toán tử dùng để thực hiện phép tính.

## Toán tử số học

+ cộng  
- trừ  
* nhân  
/ chia  
% chia dư

Ví dụ:

int c = a + b;

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
printf("so duong");
}
else
{
printf("so am");
}


---

# Vòng lặp

Vòng lặp cho phép lặp lại đoạn code nhiều lần.

## For loop


for(int i=0;i<10;i++)
{
printf("%d",i);
}


## While loop


while(i < 10)
{
i++;
}


---

# Mảng

Mảng là tập hợp nhiều phần tử cùng kiểu.

Ví dụ:


int arr[5];


Truy cập phần tử:


arr[0]


---

# Hàm

Hàm là khối lệnh thực hiện một chức năng.

Ví dụ:


int add(int a,int b)
{
return a+b;
}


---

# Con trỏ

Con trỏ là biến lưu địa chỉ bộ nhớ.

Ví dụ:


int a = 10;
int *p = &a;


---

# Đệ quy

Đệ quy là khi hàm gọi lại chính nó.

Ví dụ tính giai thừa:


int fact(int n)
{
if(n==0)
return 1;
return n * fact(n-1);
}