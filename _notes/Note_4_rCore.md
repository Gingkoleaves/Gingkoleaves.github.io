---
layout: default
title: Trip to rCore and Rust
date: 2026-02-09
permalink: /notes/Notes_4_rCore/
categories:
    - notes
tags:
    - os
    - risc-v
    - rust
---

# Rust & rCore Related Notes

## Rust基础

### 基础语法

#### 2026年2月9日

cargo new < project name>
创建项目，包含git仓库和完整的项目结构;rust 通常两种项目，依赖库和二进制项目【可以编译运行】
cargo.toml是项目元数据；cargo.lock是根据toml形成的项目依赖清单
src下的main.rs是程序的入口文件

cargo build编译【可执行文件在target/debug或target/release目录下
cargo run 编译并运行
上述二者加上 --release 参数，在release模式下编译【优化编译提升可执行文件速度，但编译耗时长；不加参数默认debug模式，不优化但编译快】

cargo check检查是否能够编译通过

对于 println 来说，我们没有使用其它语言惯用的 %s、%d 来做输出占位符，而是使用 {}，因为 Rust 在底层帮我们做了大量工作，会自动识别输出数据的类型，例如当前例子，会识别为 &str 类型。
println实际上是宏调用

最后，和其它语言不同，Rust 的集合类型不能直接进行循环，需要变成迭代器（这里是通过 .iter() 方法），才能用于迭代循环。

Rust 特性：控制流、方式语法【没有继承】、函数可以作为返回值、类型标注、条件编译、隐式返回

下载依赖库的地址是 crates.io，是由 Rust 官方搭建的镜像下载和管理服务；cargo是包管理工具，crate.io是社区的包注册中心

可以指定变量类型：let b:i32 =20、let c=30_i32、let mut d=30i32[mut表示变量值可变],let 绑定的对象默认情况下不可变
函数的返回行可以省略return;字符串必须使用双引号

#### 2026年2月10日

Rust的核心原则：所有权【任何内存对象有主人，并一般完全属于他的主人】
称let a = "hi" 为变量绑定，变量绑定就是为这个内存对象绑定主人
在变量不可变的编程环境下，需要新值时总是需要创建一个新对象;具体来说，小对象通常创建新的实例，大对象通常用更新比重新创建更快

用下划线开头忽略未使用的变量【Rust通常会警告未使用变量】,但是需要指定变量类型，否则报错
变量解构：从复发变量中解构出变量的一部分内容；如果在声明时赋值则不用指定变量类型；允许在赋值语句左侧使用元组来解构式赋值(a,b)=(1,2)
let虽然声明不可变对象，但是允许先声明后赋值，赋值后不允许改变

常量用const，编译时确定值；声明时变量名后加【: type】指定类型
变量遮蔽：同名变量，后者遮蔽前者；注意，带有let的语句是【重新绑定let x=1】，不带有let的是改变值【let x=1; x=2非法】

基础类型: i8/i16/i32/i64/i128/isize[指针大小]、u8等、f32/f64、字符串切片&str、bool、char、单元类型()[（）也是唯一可能值]

Rust 是一门静态类型语言，也就是编译器必须在编译期知道我们所有变量的类型，但这不意味着你需要为每个变量指定类型，因为 Rust 编译器很聪明，它可以根据变量的值和上下文中的使用方式来自动推导出变量的类型；但有些情况下compiler无法推断出类型【let guess = "42".parse().expect("Not a number!");】泛型方法？

rust整型默认使用i32,isize和usize用于集合索引；--debug模式下检查溢出【let i:u8 = 256】并panic，--release模式下不panic而是补码绕回
Rust给出若干方法wrapping、checked、overflowing、saturating，指定溢出时的动作【100u8.wrapping_add(200)按照补码溢出，checked_返回None;of返回补码溢出的结果和一个bool是否溢出；saturating可以限定计算后结果的范围】

注意浮点数！浮点数在某些特性上是反直觉的，；例如 f32 ， f64 上的比较运算实现的是 std::cmp::PartialEq 特征(类似其他语言的接口)，但是并没有实现 std::cmp::Eq 特征；这导致在用Rust的Hashmap【通过std::cmp::Eq判断key相同】时不能用f32/f64作为key;要避免直接比较浮点数是否相等

部分运算返回Nan【负数平方根】，所有跟 NaN 交互的操作，都会返回一个 NaN，而且 NaN 不能用来比较；x.is_nan()判断nan
对于较长的数字，可以用_ 进行分割，提升可读性:  let one_million: i64 = 1_000_000;

对于移位运算，Rust 会检查它是否超出该整型的位数范围，如果超出，则会报错 overflow。比如，一个 8 位的整型，如果试图移位 8 位，就会报错，但如果移位 7 位就不会。Rust 这样做的理由也很简单，如果移位太多，那么这个移位后的数字就是全 0 或者全 1，所以移位操作不如直接写 0 或者 -1，这很可能意味着这里的代码是有问题的。需要注意的是，不论 debug 模式还是 release 模式，Rust 都会检查溢出。

Rust 提供了一个非常简洁的方式，用来生成连续的数值，例如 1..5，生成从 1 到 4 的连续数字，不包含 5 ；1..=5，生成从 1 到 5 的连续数字，包含 5;也可以生成连续字符a..=z

Rust 不允许两种不同的类型进行比较，不允许不同类型数字计算；允许as进行类型转换【let a = 3.1 as i8;】

类型可以通过:i32指定，也可以通过后缀13.14_f32指定；数值上可以使用方法13.14_f32.round()

Rust支持unicode字符，一个字符32bits；bool单字节；单元类型(),是main()函数、println的返回值，0字节作占位符；没有返回值的函数 fn diverges()->!{< body>}

Rust函数体包括若干语句，最后一个不成语句的表达式表示返回值;语句会执行一些操作但是不会返回一个值，而表达式会在求值后返回一个值;let b = (let a = 8)非法，因为let x=1是语句不能赋值

调用一个函数是表达式，因为会返回一个值，调用宏也是表达式，用花括号包裹最终返回一个值的语句块也是表达式，总之，能返回值，它就是表达式;if语句块也可以用于表示表达式

```rust
// 语句块:
{
    let x = 3;
    x + 1
}
```

函数可以指定返回值类型：-> < type>{< body>},type为返回类型,也可以不写"-> < type>"

```rust
fn add(i: i32, j: i32) -> i32 {
   i + j
}
```

关于返回值，如果没有return或函数体最后一行不是表达式，则返回()单元类型；这在没有指定返回类型或指定返回类型为()时合法【fn func() -> () {< body>}, 但制定了返回类型的函数会error】;fn dead() -> !{}没有返回值的函数常用作导致程序崩溃的函数,因为总是无法满足“没有返回值”的要求【不能用语句作最后一行，不能return作最后一行【error：return in a function whose return type is not '()'】】

loop{}表示循环

如何申请空间，出现了三种流派：垃圾回收机制(GC)，在程序运行时不断寻找不再使用的内存，典型代表：Java、Go;手动管理内存的分配和释放, 在程序中，通过函数调用的方式来申请和释放内存，典型代表：C++;通过所有权来管理内存，编译器在编译时会根据一系列规则进行检查
类似java的自动分配空间的语言，相比cpp[局部变量在stack，new/alloc对象在heap【例如vector】]，由jvm编译器按照规则决定哪些在stack哪些在heap

内存安全：cpp中函数可以返回局部变量指针【wild-ptr】不安全；函数内的常量只在函数内使用，但是需要一直存储在常量区直到程序整体结束【认为消耗内存资源】
栈上数据需要已知大小【才能顺序进出栈】，堆上可以存储大小未知的数据【请求空间并把指针放入栈】；我们讨论的内存泄漏，发生在堆上

- Rust 中每一个值都被一个变量所拥有，该变量被称为值的所有者
- 一个值同时只能被一个变量所拥有，或者说一个值只能拥有一个所有者
- 当所有者（变量）离开作用域范围时，这个值将被丢弃(drop)

let x=5; let y=x;
对于栈上变量x[基本类型]，y=x实际上已经存在栈上空间y，作复制；y=x后二者都可以访问；如果x=string::from("123")一个堆上对象，y=x后x失去heap上空间的所有权【y和x在栈上维护指针等元信息固定大小，指向不固定大小的heap上数据】，不允许x访问heap上空间【由于局部变量离开作用域而释放所有权】

考虑let x:&str = "hello world";，这里的x指向存储在只读区的硬编码字符串，而非heap上字符串，所以可以let y=x后使用x
上述这种拷贝栈中数据并移动所有权的操作，称为move【以区别浅拷贝】；提供< object>.clone()实现堆上内容的拷贝【深拷贝】
可以把string视为一个结构体。包括ptr\len\capacity，一般的复制会转移ptr指向heap空间的所有权

Rust提供了 copy TRait，用于存储在栈上的数据类型；有copy trait的类型在赋值给其他变量后仍然可用；不可变引用有copy trait，可变引用没有
在函数传递值时，如果传递了heap上对象，则所有权转移到函数内的临时变量中；如果不把所有权转移回来，则原函数中的变量失去所有权

引用与借用：获取变量的引用，称之为借用(borrowing)，可以不进行所有权的转移
引用let y=&x 不进行所有权的转移,默认引用指向的值不可变
可变引用let y =mut &x 允许对引用的对象进行修改，但 同一作用域，特定数据只能有一个可变引用；这是为了使 Rust 在编译期就避免数据竞争;这一限制可以通过加{}限定作用域来逃避

> 数据竞争可由以下行为造成：
> 两个或更多的指针同时访问同一数据
> 至少有一个指针被用来写入数据
> 没有同步数据访问的机制

可变引用与不可变引用不能同时存在：多个不可变借用被允许是因为没有人会去试图修改数据，每个人都只读这一份数据而不做修改，因此不用担心数据被污染
引用的作用域从创建开始，一直持续到它最后一次使用的地方；变量的作用域从创建持续到某一个花括号'}'
当存在活跃的可变引用时，原所有者被冻结，不能进行任何修改操作;可变引用只是临时借用修改权限，所有权始终在原变量手中。 你可以在借用期间修改数据，但不能移动、销毁或转移所有者

Non-Lexical Lifetimes编译优化：早期的时候，引用的作用域跟变量作用域是一致的；现在调整为最后一次使用

悬垂引用也叫做悬垂指针，意思为指针指向某个值后，这个值被释放掉了，而指针仍然存在，其指向的内存可能不存在任何值或已被其它变量重新使用。在 Rust 中编译器可以确保引用永远也不会变成悬垂状态：当你获取数据的引用后，编译器可以确保数据不会在引用结束前被释放，要想释放数据，必须先停止其引用的使用

复合类型:字符串、元组、结构体、枚举类型、数组
字符串和字符串切片：切片指集合的一部分，字符串slice: let slice = &s[0..2]对引用切片；对unicode切片时必须切片在字符边界处，不然编译通过但运行panic，即按字节切片
默认let s = "string" 中s为&str类型，对全体字符的切片；字符串字面量是切片
字符的编码是unicode，每个字符占据32bits；字符串中的字符是utf-8编码，是长度可变的编码；rust语言基础类型只有str字符串【硬编码不可变】，在标准库中实现string可增长可变有所有权的utf-8字符串

原型设计时只实现接口api不完成实际内容时，可以引入编译器属性标记，忽略未使用的变量；unimplemented!()表示尚未实现函数,如果放在返回类型不为!的函数中，可以编译通过，但是运行时panic；返回类型为!则无法通过编译

&str和string类型常常可以互相转化: 字面量输入String的库函数得到string类型，string类型变量s，&s得到&str类型
字符串索引不允许对引用使用[0]索引，因为单个字节在多字节编码的utf-8中无意义
string的操作：push('c'),push_str("string"),insert()/insert_str(< byte_idx>,"string")注意byte_idx不能插入多字节字符内部；replace可以处理string和&str，返回新字符串而不是修改原字符串；

```rust
fn main() {
    let string_replace = "I like rust. Learning rust is my favorite!";
    let new_string_replacen = string_replace.replacen("rust", "RUST", 1);
    dbg!(new_string_replacen);
}
```

#### 2026年2月12日

可变字符串string的修改：push更改原有字符串，insert更改原字符串；replacen替换至多n次，replace_range接受int列表作为修改的索引范围，修改原字符串
pop删除末尾，操作原字符串；remove删除索引参数【指出字符的首字节idx】指定的字符，truncate删除指定位置到末尾；clear清空；
连接concat须有右侧是&str ;s1+&s2返回新字符串，s1所有权转移;使用format!连接字符串 let s=format!("{}",s1)
字符串操作总是要求从字符边界开始;转义符号输出unicode和ascii字符【hex表示】；对&str用.chars()遍历字符，用.bytes()遍历字节【for b in "中国人".bytes() 】
元组各元素可以类型不同，可以用模式匹配分别获取元组中元素
结构体定义: struct < Name>{ < attr>:< type>, ...,}
结构体变量必须整体声明可变与否;创建实例时需要指定< attr>:< value>,如果value变量与结构体内变量同名则不用重复< var-name>:< val-name>,只需要< val-name>,...
结构体更新可以用之前的结构体一一更新属性，也可以..user1表示其他属性沿用user1，但注意这样会导致所有权转移；把结构体中具有所有权的字段转移出去后，将无法再访问该字段，但是可以正常访问其它的字段

元组结构体：结构体必须要有名称，但是结构体的字段可以没有名称，这种结构体长得很像元组，因此被称为元组结构体；struct Color(i32, i32, i32);

单元结构体，如果你定义一个类型，但是不关心该类型的内容，只关心它的行为时，就可以使用 单元结构体：struct AlwaysEqual; impl SomeTrait for AlwaysEqual{};

结构体数据的所有权：我们想要这个结构体拥有它所有的数据，而不是从其它地方借用数据；如果非要借用数据，需要引入lifetime来保证引用的作用范围比借用的数据的作用范围小

使用 #[derive(Debug)] 来打印结构体的信息，因为{}需要结构体时吸纳fmt::Display,而以上编译条件是Rust自动提供的display方式，需要用{:?}或{:#}占位符

还有一个简单的输出 debug 信息的方法，那就是使用 dbg! 宏，它会拿走表达式的所有权，然后打印出相应的文件名、行号等 debug 信息，当然还有我们需要的表达式的求值结果。除此之外，它最终还会把表达式值的所有权返回；dbg!(s1)输出到stderr

枚举类型:enum < name>{< enum1>,< enum2>,}
name是枚举类型，enum[i]是枚举变体[也视为类型]，enum的一个实例是枚举值，一个枚举值包含两部分[变体,可选数据]；通过let diamond = PokerSuit::Diamonds;双冒号选定枚举值，允许可选数据在不同变体下不同

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

同一化类型：某个函数希望可以用一个形参接受两种type的数据，定义枚举类型将这两种type的实例作为可选参数

Null表示空值带来了大量检查，Rust采用Option枚举变量解决问题：

```rust
enum Option< T> {
    Some(T),
    None,
}
```

由于使用泛型< T>,如果使用 None 而不是 Some，需要告诉 Rust Option< T> 是什么类型；为什么Option比null安全? 为了拥有一个可能为空的值，你必须要显式的将其放入对应类型的 Option< T> 中，这样就无法直接与T类型运算
接着，当使用这个值【例如作为传入参数】时，必须明确的处理值为空的情况【通过match对各个变体分类讨论】;强制要求以同时考虑多种变体的方式设计Option处理函数，避免了期望某值不为空但实际上为空的情况[如果没考虑所有变体会导致non-exhaustive patterns: `None` not covered]
总之，由于所有可能为空的值都用Option类型表示，所以只要一个值不是 Option< T> 类型，你就 可以 安全的认定它的值不为空

array与ector
array可以通过let a=[3;5];声明长度为5,初始值为3的定长数组,这是通过copy实现的，但复杂类型没有实现深拷贝，会报错, 可选的实现方式let array: [String; 8] = std::array::from_fn(|_ i| String::from("rust is good!"));;也可以 let a:[i32:5]指定类型和长度
Rust会检查数组越界并panic

数组的类型可以用[type,length]描述，切片实际上是引用[记录切片位置和长度]，是运行时数据；数组类型是&[i32;4],切片类型是&[i32],因为前者长度可以在编译时确定

### 流程控制

if语句块是表达式，可以用返回值给变量绑定；用 if 来赋值时，要保证每个分支返回的类型一样，否则报错

注意，使用 for 时我们往往使用集合的引用形式，除非你不想在后面的代码中继续使用该集合（比如我们这里使用了 container 的引用）。如果不使用引用的话，所有权会被转移（move）到 for 语句块中，后面就无法再使用这个集合了)：for item in &container{}

for的本质是调用后者的.iter()方法或类似方法【根据container是集合类型、集合的引用、可变集合引用】

如果想在循环中获取元素的索引，for (i, v) in a.iter().enumerate(){}；用_ 忽略本值类型和值；用索引下标访问相比用迭代器[for循环]直接访问，会导致额外的边界检查，且可能在循环内collection发生变化【所有权不断变化】，后者不会有这些性能和安全问题

loop是一个简单的无穷循环，必须配合break；loop是表达式有返回值；break可以单独使用也可以带返回值

### 模式匹配

可以matchenum，也可以match基本类型
match target {
    模式1 => 表达式1,
    模式2 => {
        语句1;
        语句2;
        表达式2
    },
    _ => 表达式3
}

- match 的匹配必须要穷举出所有可能，因此这里用 _ 来代表未列出的所有可能性
- match 的每一个分支都必须是一个表达式，且所有分支的表达式最终返回值的类型必须相同
- X | Y，类似逻辑运算符 或，代表该分支可以匹配 X 也可以匹配 Y，只要满足一个即可

```rust
// 模式绑定：取出enum内的可选数据
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}
// 这里取出Quater的可选数据作为state变量
```

穷尽匹配：Rust提供两种方式接住没有匹配项的输入
在_通配符之外，提供基于变量接受值的方式，允许访问这个输入值【用通配符_ 承接则无法访问输入值】

```rust
#[derive(Debug)]
enum Direction {
    East,
    West,
    North,
    South,
}

fn main() {
    let dire = Direction::South;
    match dire {
        Direction::East => println!("East"),
        other => println!("other direction: {:?}", other),
    };
}
```

这里other接住输入值【如何判断=>前的标识符是变量还是枚举值/全局常量?同名时优先视为枚举/常量】

#### 2026年2月13日

如果只关心模式匹配的一种结果，则可以用if-let表示模式匹配；实际上是Rust的语法糖,转化为match

```rust
if let Some(3) = v {
    println!("three");
}
```

matches!(< var>,< pattern>) 宏,如果匹配则返回true；这里pattern在处理带可选数据的enum时可以使用“匹配守卫”实现更细致的匹配：matches!(bar, Some(x) if x > 2)，用x匹配可选数据，这里x会对外部同名变量遮蔽,多个或pattern后使用match-guard会对所有pattern使用match-guard而非最后一个

pattern的构成：字面值,解构的数组、枚举、结构体或者元组,变量,通配符,占位符【在绑定大量变量时使用】
使用pattern的地方：match、if-let、while-let、for循环解构迭代器的返回值、let绑定值到变量名，let-else可驳模式匹配，匹配失败进入else语句，其中一定是不可返回的代码块;let-else 相比if let的优点是，如果匹配成功，let-else匹配到的变量可以在let-else之外继续使用，而if-let只能在本语句块中使用

match后是一个语句块，对外部的同名变量遮蔽；模式匹配可以使用|单分支匹配多pattern，可以用1..=5匹配多pattern【只允许字符和数字】

可以let < struct>{< attr1>:< var1>}从结构体中提取属性的值到变量；可以部分解构，match p {  Point { x, y: 0 } => println!("On the x axis at {}", x)};可以解构嵌套的结构体、复杂的嵌套元组；可以解构定长不定长数组[用..]；可以用_忽略函数传入参数,_ 不导致转移权转移

当你既想要限定分支范围，又想要使用分支的变量时，就可以用 @ 来绑定到一个新的变量上，实现想要的功能；Message::Hello { id: id_variable @ 3..=7 } => {println!("{}",id_variable)}

使用 @ 还可以在绑定新变量的同时，对目标进行解构;    let p @ Point {x: px, y: py } = Point {x: 10, y: 23};
可见用法为 < var> @ < 解构pattern>,在let和match中都是如此

### Method

Rust可以为struct定义方法，但要求struct的数据和方法[implementation]分开定义：struct Circle{< attrs>}; impl Circle{< methods>};

在结构体内部，用Self指代结构体类型，self指代调用方法的实例；&self实际是self:&Self的简写；在方法参数中可以用self\&self\&mut self获取调用实例，self会转移所有权到本方法中，后二者不会

从模块外访问结构体时，pub关键字声明结构体某个属性是公开可见直接访问的，默认私有不可直接访问；模块是一段命名空间+访问控制

Rust的自动引用和解引用，当使用 object.something() 调用方法时，Rust 会自动为 object 添加 &（视可见性添加&mut)、 * 以便使 object 与方法签名匹配

结构体的构造器方法：一种关联函数【定义在 impl 中且没有 self 的函数被称之为关联函数；因为它没有 self，不能用 f.read() 的形式调用，因此它是一个函数而不是方法，它又在 impl 中，与结构体紧密关联，因此称为关联函数】
因为是函数，所以不能用 . 的方式来调用，我们需要用 :: 来调用，例如 let sq = Rectangle::new(3, 3);这个方法位于结构体的命名空间中,用::语法用于关联函数和模块创建的命名空间
可以为枚举类型实现方法

### 泛型和trait

多态：同一个接口对不同对象的实现不同，是oop的概念
泛型：实现多态的手段，本质是类型参数化；称为泛型参数，使用前需要在函数签名/结构体签名中声明，可以声明多个泛型参数

impl< T> Point< T>{}; 这里的 Point< T> 不再是泛型声明，而是一个完整的结构体类型，因为我们定义的结构体就是 Point< T> 而不再是 Point

可以在结构体定义、枚举声明、函数声明中使用泛型；可以为具体的泛型类型实现方法，对于其它泛型类型则没有定义该方法

对值的泛型：数组类型包括长度，可以用参数表示这个长度，从而可以接受任意长度的数组【不用泛型的方法是使用数组的切片引用，切片的类型中没有长度参数】

```rust
fn display_array< T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
    println!("{:?}", arr);
}
```

称为const泛型，可以根据类型的值参数作运行控制

常量函数const fn 允许我们在编译期对函数进行求值，以提高运行时的性能或满足某些编译期的约束条件
const fn在编译期执行，将计算结果直接嵌入到生成的代码中。这不仅提高了运行时的性能，还使代码更加简洁和安全

在 Rust 中泛型是零成本的抽象，意味着你在使用泛型时，完全不用担心性能上的问题；Rust 是在编译期为泛型对应的多个类型，生成各自的代码，因此损失了编译速度和增大了最终生成文件的大小
编译器寻找所有泛型代码被调用的位置并针对具体类型生成特定类型的代码，这个过程称为单态化

 #[derive(Debug)]，它在我们定义的类型(struct)上自动派生 Debug 特征，接着可以使用 println!("{:?}", x) 打印这个类型
特征定义了一组可以被共享的行为，只要实现了特征，你就能使用这组行为;如果不同的类型具有相同的行为，那么我们就可以定义一个特征，然后为这些类型实现该特征。定义特征是把一些方法组合在一起，目的是定义一个实现某些目标所必需的行为的集合

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

这里使用 trait 关键字来声明一个特征，Summary 是特征名。在大括号中定义了该特征的所有方法，在这个例子中是： fn summarize(&self) -> String;只定义特征的签名，不定义具体行为

```rust
//为特定类型实现trait：
pub struct Weibo {
    pub username: String,
    pub content: String
}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}
```

之后可以视为一般的本类方法调用    println!("{}",weibo.summarize());

Orphan Rule: 如果你想要为类型 A 实现特征 T，那么 A 或者 T 至少有一个是在当前作用域中定义的；这是为了保证其它人编写的代码不会破坏你的代码，也确保了你不会莫名其妙就破坏其他人的代码

可以在特征中定义具有默认实现的方法，这样其它类型无需再实现该方法，或者也可以选择重写该方法；使用默认实现只需要impl < trait> for < struct> {}之后可以调用< trait>的默认实现

可以在trait的方法1中调用trait的方法2；可以使用特征作为函数参数，fn notify(item: &impl Summary){}要求参数是实现了Summary特征的参数,标准写法是fn notify< T: Summary>(item: &T) {}
多约束的语法糖和标准写法：fn notify(item: &(impl Summary + Display)) {}，pub fn notify< T: Summary + Display>(item: &T) {}，用+连接需要实现的traits

Rust提供一种形式上更清晰的写法：
fn some_function< T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {} 等价于使用where整理约束
fn some_function< T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug {}

使用特征约束有条件地实现方法或特征：使用泛型，只有满足条件的类型才为他实现某些方法
impl< T: Display + PartialOrd> Pair< T> {}
只为有Display和PartiaOrd特征的类型实现以下特征

可以指定返回值是实现了特征的类型 fn returns_summarizable() -> impl Summary；虽然这么写，但是要求这个函数的各个出口返回值类型必须相同，不能不同出口返回不同类型函数

通过derive派生特征：#[derive(< trait>)]用于标记结构体，会让被标记的结构体自动实现对应的默认trait；Rust官方提供了若干这样的默认trait实现

要调用某个类型上的特征方法，必须让该特征在当前作用域可见,通过use < trait>;语句导入特征，< trait>描述为< lib>::< mod>::< trait>

在trait中可以用type要求定义“关联类型”，所有对trait的实现必须指出关联类型的具体值

Rust难以处理多个实现了trait的类型在同一个列表的问题【要求列表元素相同】、对指定返回值类型必须实现trait的函数要求所有返回路径必须相同类型；为了解决以上问题，Rust引入了“特征对象”的概念

特征对象 是一种特殊的struct，表示具有某种trait的struct的实例【实际上存储了具体数据和trait实现的指针】；使用特征对象充当形参时，有Box< dyn < trait>>和&dyn < trait>两种声明方式，dyn表示运行时确定类型;作为实参时可以直接写Box::new(x)或&x

此时Vec< Box< dyn Draw>>可以容纳任何实现了Draw特征的类型，返回Box::new()对象也解决了不能返回不同具体类型的->impl < trait>的问题；另一个好处是编译器会检查Vector中对象是否实现了指定trait，在编译阶段就报错了

特征对象出现在形参中都需要使用引用，因为各个实现了trait的类型内存大小不同，不能统一处理传参

泛型是在编译期完成处理的：编译器会为每一个泛型参数对应的具体类型生成一份代码，这种方式是静态分发(static dispatch)，因为是在编译期完成的，对于运行期性能完全没有任何影响

Box生成的指针，对于静态分发对象直接指向heap/stack上的内存；对于动态分发的对象dyn，维护两个指针，ptr指向heap/stack上的实际strcut内存，vptr指向一个vtable,存储实际struct的大小、释放器、mothods
传入实例对象时，可以隐式转换为特征对象类型；对于特征对象，只能调用特征内的方法，无法调用本对象的其他方法

不能指定特征对象同时具有多个特征；如果需要，则应当合成一个大特征trait Huge:small1 + small2 {}要求拥有trait Huge的对象必须有trait Draw和Click; impl< T: small1 + small2> Huge for T {}；编译器自动形成扁平化的大vtable

特征对象的限制：只有满足特定条件的trait才能拥有特征对象，要求trait的所有方法返回类型不能为self，且方法不能涉及任何泛型参数；这是为了避免在特征方法内使用具体类型的方法、避免特征对象使用具体类型的方法【否则编译器报错error】

再论关联类型：关联类型是在特征定义的语句块中，声明一个自定义类型，这样就可以在特征的方法签名中使用该类型[impl中需要给出这个关联类型的实际类型]
Self 用来指代当前调用者的具体类型，那么 Self::Item 就用来指代该类型实现impl中定义的 Item 类型【type Item; fn next(&mut self)-> Option< Self::Item>;】

为什么不用泛型？定义了关联类型的形参只需要要求参数满足本trait；如果用泛型则每个接受本trait的函数都需要重写一次关联类型受到的特征约束

使用泛型的声明：

```rust
trait Container< A,B> {
    fn contains(&self,a: A,b: B) -> bool;
}

fn difference< A,B,C>(container: &C) -> i32
  where
    C : Container< A,B> {...}
```

可以看到，由于使用了泛型，导致函数头部也必须增加泛型的声明，而使用关联类型，将得到可读性好得多的代码：

```rust
trait Container{
    type A;
    type B;
    fn contains(&self, a: &Self::A, b: &Self::B) -> bool;
}

fn difference< C: Container>(container: &C) {}
```

关联类型还可以被其他特征约束：type A: Display;

带有泛型的trait会先形成各类型下的trait再应用？
编译器要求在实现带有泛型的trait时，必须在类型占位符的各地方保持一致，否则编译器报错；这里RHS=Self是泛型默认值

```rust
trait Add< RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}
// 这里对Add的实现中，必须写入相同的两处RHS类型，如下两处meters：
impl Add< Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

如何处理含有多个特征时，各特征中同名方法的调用？不加trait时调用本struct类型的方法【本类型不存在这个方法时编译器报错】；trait中的方法需要显式调用：

```rust
fn main() {
    let person = Human;
    Pilot::fly(&person); // 调用Pilot特征上的方法
    Wizard::fly(&person); // 调用Wizard特征上的方法
    person.fly(); // 调用Human类型自身的方法
}
```

这里可见，不是把Pilot::fly当作person的方法调用

如何调用各struct上拥有的trait的关联函数？完全限定语法
println!("A baby dog is called a {}", < Dog as Animal>::baby_name());
将struct dog注解为trait Animal，这会调用impl Aninmal for dog

完全限定语法精确定义为：

```rs
< Type as Trait>::function(receiver_if_method, next_arg, ...)
```

receive_if_methods是self的表达式，仅方法需要传入，这里是关联函数不需要
完全限定语法是调用函数最为明确的方式，如果不要调用trait的方法，则去掉"as < trait>"

特征依赖：实现前者必须先实现后者

```rs
use std::fmt::Display;
trait OutlinePrint: Display {}
```

在外部类型上实现外部特征：使用一个元组结构体包裹外部类型对象，在这个结构体上实现外部特征，具体实现是对本元组的第一个对象【也即那个外部类型对象】操作

```rs
use std::fmt;
struct Wrapper(Vec< String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

Rust 提供了一个特征叫 Deref，实现该特征后，可以自动做一层类似类型转换的操作，可以将 Wrapper 变成 Vec<  String > 来使用，就不用手动self.0间接转换

### 集合类型

标准库中实现的heap上变长结构：Vector,KV-HashMap,String
Vector只能存储相同类型结构；提供Vec::new和Vec![1,2,3]宏创建vec；.push()增加元素；跟结构体一样，Vector 类型在超出作用域范围后，会被自动删除；允许通过索引和get访问元素，前者直接返回值【不安全，runtime报错】，后者返回Option< &T>对象

迭代遍历时使用 &v 或迭代器比用下标遍历安全，前者保证不会越界而且更快；vec存储不同类型对象可以通过enum【为不同变体实现不同可变数据，从未视为不同对象】、特征对象【用Box<  dyn <  trait >>类型的vec实现】

Vec::with_capacity(10)申请一个容量10个类型大小的vector；v.extend([1,2,3])写入数组；.reserve(100)保留至少100容量；.shrink_to_fit()释放不用的容量

#### 2026年2月16日

调用本struct的方法时，由于方法的self指针常常为&self,会隐式地把原类型转化为原类型的引用/可变引用

常见方法：insert(idx,element),remove(idx)返回当前vec长度,pop()返回Option，<  array>.to_vec()返回vec，append(&mut <  vec1>)清空vec1并把内部元素移动到调用者末尾，truncate截断到指定长度，retain(|x| <  bool expression involves x>)保留满足条件的元素，drain(<  array of idx>)删除指定范围的元素并返回被删除元素的迭代器;sort和sort_by,sort_unstable和sort_unstable_by,因为float包含nan值没有实现偏序关系所以需要sort_by(|a b| a.partial_cmp(b).unwrap())

迭代器默认是惰性（Lazy）的。这意味着如果你只写 map、filter 或 drain，它们就像是一张“待办清单”，列出了要做的步骤，但只要你不去收割结果【collect】，什么都不会发生

对结构体排序需要实现ord、eq、paritalord、partialord属性，也可以#[derive(Eq)],默认实现是逐个属性比较;derive Ord需要结构体中所有属性实现了Ord特性

HashMap<  Ktype,Vtype>需要手动use std:collections::HashMap;所有key相同类型，value也具有相同类型;常用方法:关联函数new()，方法insert()；对迭代器使用collect()生成多种类型的目标集合【    let teams_map: HashMap< _,_> = teams_list.into_iter().collect();】,有时需要类型标注更明确

用已有对象insert得到Hashmap时，存在所有权转移,当存在同名键返回旧值的Option同时用新值覆盖，如果不存在作为返回None；get(&<  key>)获取Option< &<  value>>对象，查不到时为None；可以通过 for (key,value) in &hashmap的方式遍历

Borrow<  Q> 这个 Trait 的定义要求：如果一个类型 K 实现了 Borrow<  Q>，那么它必须能通过 .borrow() 方法产生一个 &Q；entry()返回枚举类型包括Occupied和Vacant两个变体，包含指向查询的key的引用

### 生命周期

作用域是从变量定义开始的，变量不被回收销毁的物理边界；lifetime是‘引用有效’的范围，在这个范围外引用错误

引用的生命周期不能比原值结束的更晚，编译器进行borrow-check；
函数中的生命周期分析：考虑随即返回输入参数的引用，运行结束后才能确定具体返回的引用，这导致难以计算这些引用的生命周期；此时需要手动标注生命周期让编译器进行借用检查，生命周期标注并不会改变任何引用的实际作用域

fn useless< 'a>(first: &'a i32, second: &'a i32) {} 使用生命周期标注前需要声明< 'a>,生命周期标签只用于引用；Rust 不允许“未初始化的引用” let a:&i32 ;

生命周期标记存在于函数参数和返回值前，通过引用类型的参数的引用对象的作用域的最短值，向编译器保证返回值的实际lifetime一定在这个最短值以内；此时编译器检查“引用”的出现时机和“引用对象的作用域”是否匹配时，就知道了函数返回值【一个引用】对应的作用域，从而可以检查判断;之前编译失败是因为编译器不知道返回值应该找那一个作用域检查

类似的，如果返回函数内部局部变量的引用，就算外部caller不使用这个返回值，编译器也认为引用的生命周期超过了原对象的作用域【函数体内】；每一个引用（无论是变量里的引用，还是函数参数、返回值的引用）都必须无条件通过借用检查器（Borrow Checker）的生死大关

#### 2026年2月18日

函数或者方法中，参数的生命周期被称为 输入生命周期，返回值的生命周期被称为 输出生命周期

结构体中的生命周期声明:结构体中的引用都需要生命周期声明，否则无法通过编译；要求声明的引用的原对象作用域大于本结构体的生命周期

生命周期消除：函数内的引用都需要具有生命周期，但是Rust觉得每次必须显式标注过于麻烦,提供了三条自动生成生命周期的规范;三条规则应用后如果仍然存在没有生命周期标记的,编译器报错

每一个引用参数【注意是参数，不包括返回值】都会获得独自的生命周期：例如一个引用参数的函数就有一个生命周期标注: fn foo< 'a>(x: &'a i32)，两个引用参数的有两个生命周期标注:fn foo< 'a, 'b>(x: &'a i32, y: &'b i32), 依此类推。

若只有一个输入生命周期（函数参数中只有一个引用类型），那么该生命周期会被赋给所有的输出生命周期，也就是所有返回值的生命周期都等于该输入生命周期：例如函数 fn foo(x: &i32) -> &i32，x 参数的生命周期会被自动赋给返回值 &i32，因此该函数等同于 fn foo< 'a>(x: &'a i32) -> &'a i32

若存在多个输入生命周期，且其中一个是 &self 或 &mut self，则 &self 的生命周期被赋给所有的输出生命周期：拥有 &self 形式的参数，说明该函数是一个 方法，该规则让方法的使用便利度大幅提升。

方法中的声明周期：生命周期标注也是结构体类型的一部分，方法也会应用三条规则补全生命周期；方法实现的带生命周期的一般形式：impl < 'a> Struct< 'a>{methods};可以通过'a:'b来约束'a比'b活得久，让编译器明确要检查的内容

‘static 全局生命周期，用于常量引用

### 返回值与错误处理

Rust中的错误主要分为两类，分别对应Result< T,E>和panic!
可恢复错误，通常用于从系统全局角度来看可以接受的错误，例如处理用户的访问、操作等错误，这些错误只会影响某个用户自身的操作进程，而不会对系统的全局稳定性产生影响
不可恢复错误，刚好相反，该错误通常是全局性或者系统性的错误，例如数组越界访问，系统启动时发生了影响启动流程的错误等等，这些错误的影响往往对于系统来说是致命的

数组越界访问导致panic；cargo run在debug模式下加入RUST_BACKTRACE=1打印backtrace信息；有两种panic处理方式，打印错误信息和直接终止abort

```rs
enum Result< T, E> {
    Ok(T),
    Err(E),
}
```

有的函数返回Result对象，通过unwrap()在成功时得到T对象，失败时panic；.expect("msg")功能相同，但会在panic打印msg信息

在搭建示例、原型、测试时可以panic避免具体代码；会预期出现的错误类型不妨返回具体的错误数据；非预期、影响后续代码、导致内存安全的错误一般直接panic

panic!实际上是一个宏，会调用std::panic::panic_any()函数，调用panic_hook,进行栈展开【释放资源，清理panic环境，尝试回到不受影响的context】

return、panic!等表达式没有返回值，可以通过match对返回值类型相同的检查；

通过?简化match穷尽匹配Result：?是一个宏，展开为match Result的语句，错误则return Err(e)；?提供了从各种具体Error trait转换为std::err:Err的转换；?也可以用于Option对象的自动match，如果是None直接返回，否则返回Some的可变数据；?需要用在let 语句之后，用一个变量承载正确值,这是因为 the `?` operator can only be used in a function that returns `Result` or `Option`

还可以通过try!宏来处理错误，返回OK对应的可变数据或直接return；由于必须要包裹整个语句，通用性差只能用于Result，作为普通宏【?深度优化】被废弃

### 包和模块

项目(Packages)：一个 Cargo 提供的 feature，可以用来构建、测试和分享包
包(Crate)：一个由多个模块组成的树形结构，可以作为三方库进行分发，也可以生成可执行文件进行运行
模块(Module)：可以一个文件多个模块，也可以一个文件一个模块，模块可以被认为是真实项目中的代码组织单元

#### 2026年2月26日

Cargo 有一个惯例：src/main.rs 是二进制包的根文件，该二进制包的包名跟所属 Package 相同，在这里都是 my-project，所有的代码执行都从该文件中的 fn main() 函数开始

cargo new 创建一个新Package,同时创建一个bin类型的同名crate，代码从src/main.rs开始；常见项目结构如下
.
├── Cargo.toml
├── Cargo.lock
├── src
│   ├── main.rs
│   ├── lib.rs
│   └── bin
│       └── main1.rs
│       └── main2.rs
├── tests
│   └── some_integration_tests.rs
├── benches
│   └── simple_bench.rs
└── examples
    └── simple_example.rs

用mod关键字定义模块，允许嵌套定义；模块内可以定义函数，结构体，枚举，特征等

```rs
// 餐厅前厅，用于吃饭
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}
```

crate 树：src/main.rs 和src/lib.rs 可以视为模块crate-root嵌套定义其内部的模块，而不写在mod后的本文件内函数/结构体可以视为定义在crate-root这一module内部的方法
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
这颗树展示了模块之间彼此的嵌套关系，因此被称为模块树。其中 crate 包根是 src/lib.rs 文件，包根文件中的三个模块分别形成了模块树的剩余部分。

Binary Crate (二进制箱): 如果目录下有 src/main.rs，它就是这个 Crate 的 Root。
Library Crate (库箱): 如果目录下有 src/lib.rs，它就是这个 Crate 的 Root。
其他文件: src/console.rs、src/sbi.rs 等，在编译器眼中只是普通的文本文件，除非 Root 文件（main.rs）声明了它们，此时才把整个文件视为一个module

main用本crate内的模块以crate::开头，用lib中mod用package-name::开头，src/bin中其他crate用对应crate名::开头【所有src/bin内的.rs都是独立crate，文件夹通过config也是crate，但允许其中文件不都是独立crate】；src内其他文件使用crate::表示从包根开始，往往是main

### 用路径引用模块

绝对路径：从crate-root开始，以crate或package名开头，用::连接逐层模块名
相对路径：从当前所在module开始指定调用的函数,用self/super/mod-name开始，也可以直接从当前层次mod名开始

Rust默认所有类型和模块、函数都是私有的；同一个module下可以互相访问，但是跨mod访问不允许【即使是父mod内函数访问子module内函数也不允许】,子mod可以访问父module
模块module可见与否，与其内部函数可见与否无关；用pub标记可见，pub mod/pub fn
注意，super表示当前module的父亲，而不是当前所在函数所在的module

特别地，将结构体设置为 pub，但它的所有字段依然是私有的，将枚举设置为 pub，它的所有字段也将对外可见

use语句将这些外来的crate从深层拉出加载到crate-root下，可以引入crate，也可以引入fn；use导入模块而非fn来避免同名冲突，也可以用as关键字避免；use引入的项默认私有，可以在use前加pub表示这是一个公有项【可以改变原模块的可见性，可以统一导入若干模块再pub来提供若干不同来源api的统一调用接口】
同名struct/fn时，本地优先级更高

引入第三方包：修改Cargo.toml中的[dependencies]，在源文件中加入use语句；用{}批量从一个来源导入crate/fn；用\*表示引入所有pub项；
use std::io::{self, Write};代替use std::io; use std::io::Write;

pub(crate) item;将可见性限制为当前crate内对象，通过in crate::< module>限定某个module可见；具体如下
pub 意味着可见性无任何限制
pub(crate) 表示在当前包可见
pub(self) 在当前模块可见
pub(super) 在父模块可见
pub(in < path>) 表示在某个路径代表的模块中可见，其中 path 必须是父模块或者祖先模块
私有指的是只能被相同mod下的对象访问

### 注释：代码、文档、包和模块

// 开始的行注释、/\*...\*/ 包裹的块注释
文档注释提供包/模块的快速了解，在一个struct/fn前紧贴；可以用cargo doc转换为html网页文件，支持md语法；需要位于lib类型的包内，被注释的对象需要pub；用///或/\*\* \*\*/注释
包和模块的注释，需要添加到包、模块的最上方；通过//!或/\*! \*/的方式；会在cargo doc的开头展示

文档测试：在文档注释[函数前的doc注释]中实现测试

```rs
/// `add_one` 将指定值加1
///
/// # Examples11
///
/// ```rust
/// let arg = 5;
/// let answer = world_hello::compute::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

用cargo test运行测试，可以在rust后用','连接运行选项，例如should_panic表示希望该用例panic；可以在///内用fn main()运行复杂测试；可以用#把行从cargo doc的输出中隐藏但不影响cargo test

文档注释中的代码跳转：允许在cargo doc的输出中实现对引用项来源的跳转
/// `add_one` 返回一个[`Option`]类型
pub fn add_one(x: i32) -> Option< i32> {
    Some(x + 1)
}
这里的['Option']在html中体现为超链接，也可以在['']内写模块路径给出跳转；同名不同类型的项可以使用标示类型的方式进行跳转

```rs
/// 跳转到结构体  [`Foo`](struct@Foo)
pub struct Bar;

/// 跳转到同名函数 [`Foo`](fn@Foo)
pub struct Foo {}

/// 跳转到同名宏 [`foo!`]
pub fn Foo() {}

#[macro_export]
macro_rules! foo {
  () => {}
}

可以为类型定义别名方便搜索：
#[doc(alias = "x")]
#[doc(alias = "big")]
pub struct BigX;

#[doc(alias("y", "big"))]
pub struct BigY;
```

### 格式化输出

print!输出到stdout；println!输出到stdout在末尾添加换行符；format!输出到string字符串；eprint!\eprintln!输出到stderr
占位符{}适用于实现了 std::fmt::Display 特征的类型，用来以更优雅、更友好的方式格式化文本，例如展示给用户；{:?} 适用于实现了 std::fmt::Debug 特征的类型，用于调试场景；{:#?}类似{:?}但输出格式更优美

通过占位符中的位置参数指定替换的参数顺序：println!("{1}{0}", 1, 2); // =>"21"；通过{}中具名参数指定名称：println!("{argument}", argument = "test"); // => "test"；带名称的参数必须放在不带名称参数的后面

格式化输出，:后参数影响输出格式
:5设置宽度；:05用0填充；:+正数显示+；:>5右对齐；:^5居中对齐；:%5用%填充；:.5保留小数点后5位，或字符串前5字符；通过参数来设定精度println!("{:.1$}", v, 4);等价于{:.4}
// {:.*}接收两个参数，第一个是精度，第二个是被格式化的值 => Hello abc!
println!("Hello {:.*}!", 3, "abcdefg");
用 # 号来控制数字的进制，#b\#o\#x\#X\x不带前缀小写十六进制,{:#b}
{:2e}指数显示法1e9；{:p}匹配引用并视为指针地址；{{、}}和\"表示转义
格式化字符串中插入变量值，变量值视为参数
let (width, precision) = get_format();
for (name, score) in get_scores() {
  println!("{name}: {score:width$.precision$}");
}

#### 2026年2月27日

### Rust Course homeworks

mut必须在变量前,    let mut (x, y) = (1, 2); 非法
可以用let a:u16 = 38_u8 as u16;的方式转化38_u8的类型
'_'作为数字字面量的可读性分隔符;默认的浮点数变量类型f64;字面量浮点数调用方法需要标注字面量的类型f32/f64

range具体实现为“开区间”和“闭区间”两种类型；即使整数内容一样range(1..=4)和range(1..5)，具体assert_eq!()时不通过

rust的赋值表达式的值是();fn不指出返回值类型默认返回()；as_bytes()返回切片，into_bytes()返回Vec,移动所有权

当所有权转移时，可变性也可以随之改变；Box< T> 是一个把数据分配在 堆（heap） 上的智能指针，&Box< T>由于Box实现了Deref，所以会返回&T类型值；通过解构模式匹配可以取得struct的部分变量的所有权，此时struct整体无法访问，但是持有所有权的部分可以访问 let Person { name, ref age } = person; ref用于变量声明为引用

不可变变量不可以被可变借用,可变借用&mut;字符串字面量的类型是 &str,正常情况下不使用str；let s:Box< str>="hello-world".into()自动推断目标类型，字面量存储在rodata；.replace()生成新string；只能将 String 跟 &str 类型进行拼接，并且 String 的所有权在此过程中会被 move; String对象被&可以deref为&str类型；可以用r"xxx"形式写转义字符【\t、\u{211D}等】多的字符串,用r###"< string>"###写包含#、"的字符串，前后的#数量相同

[i32]是一个DST，一段连续的i32区域，但编译期不知道长度的切片；切片的类型[< type]，常用于&[i32]表示切片；
let bytestring: &[u8; 21] = br"this is a byte string"; 字节数组b,raw-string r,这是不用utf-8存储的方式；str::from_utf8(&[u8,21])将字节数组转为str类型，可能失败

无法通过索引的方式去访问字符串中的某个字符，但是可以使用切片的方式 &s1[start..end] ，但是start 和 end 必须准确落在字符的边界

```rs
for c in "你好，世界".chars(){
    println!("{}", c)
}
```

用.chars()获取每个unicode；另外，可以使用三方库 utf8_slice 来访问 UTF-8 字符串的某个子串，该库索引的是字符，而不是字节

#### 2026年2月28日

数组的类型是 [T; Length],可以用占位符_让编译器推导参数let arr: [_; 3] ；批量初始化    let list: [i32; 100] =  [1;100];
[i32] 和 str 都是切片类型，切片的长度无法在编译期得知，因此你无法直接使用切片类型;切片引用占据2字大小；slice常用于借用数组的连续部分；

元组中元素可以是不同类型；可以用tuple.1作为索引访问元素；元组的类型描述为({type},{type},{type},...)

对于结构体，我们必须为其中的每一个字段都指定具体的值,不能空缺；元组结构体看起来跟元组很像，但是它拥有一个结构体的名称，该名称可以赋予它一定的意义;Rust不允许将结构体的某个字段专门指定为可变的,只能整体认为可变/不可变，mut加在变量前；初始化时如果变量名和结构体字段名相同，可以省略field:field前半部分【field:】

enum类型的变体绑定一个u8,可以通过< enum-typr> as u8转化，值从第一个变体递增；有可选数据名的，初始化时必须以< name>:< value>方式声明；if-let模式匹配简写只有一个match对象；enum实现链表，Box::new(self)将self移动到堆上

```rs
let o = Some(7);
if let Some(i)=o {} //模式匹配
```

if/else 可以用作表达式来进行赋值;for in 迭代一个迭代器；只有iterator可以调用enumerator，.iter()不可变借用迭代，.iter_mut可变借用迭代,.into_iter/for-in 循环时move迭代改变所有权;loop通过break < value>;的方式返回值；多层循环时可以为continue/break加标签来决定跳出什么循环

```rs
enum Message {
    Quit,
    Move { x: i32, y: u32 },
    Write(String),
    ChangeColor(i32, i32, i32),
} // 这里Move后实际是一个匿名结构体
```

matches!(value,type/value)宏可以只关心部分值，不用如match一样考虑所有变体

用match匹配结构体时，如果match p1{Point(x:cx,y:cy)=>{}}则绑定x到cx，y到cy；如果同时期望复杂匹配Point { x: 0..=5, y: 10 | 20 | 30 },此时没有绑定匹配量到match内作用域的变量上；Point(x,y)=>{}自动绑定同名x，y属性到match内作用域的同名变量【效果同Point(x:x,y:y)】;如果希望在复杂匹配的同时绑定，需要y:y@(匹配模式)使用@操作符

match guard:Some(x) if x< split => assert!(x <  split),在match分支模式之后的额外if条件

使用模式 &mut V 去匹配一个可变引用时，你需要格外小心，因为匹配出来的 V 是一个值，而不是可变引用,这实际上也是一种模式匹配[解构];不能通过match &mut mut V一个可变借用把实际值的所有权拿出来

impl中，形参`&self` 是 `self: &Self` 的语法糖；`&mut self` 是 `self: &mut Self` 的语法糖【&mut是一个类型，可变引用类型】;`self` 是 `self: Self` 的语法糖
注意impl中:分隔形参和类型；结构体的模式匹配中:分隔属性名和匹配变量/match模式；

关联函数往往可以用于构造函数，初始化一个实例对象；返回结构体< Struct-name>{< attribute>:< value>}

#### 2026年3月2日

const泛型：针对值的泛型，匹配多种值【一般的泛型是针对类型的，匹配多种类型】；常见于匹配数组大小，需要指明const泛型的类型；实参是const泛型、字面量、字面量表达式

函数定义可以在参数后加where语句为泛型添加约束条件；先定义trait【提供声明和默认实现】再为具体类型impl；不能直接调用特征中的函数，除非指定具体impl的类型，即使函数与具体类型无关

可以使用 #[derive] 属性来派生一些特征:#[derive(PartialEq, PartialOrd)];运算符重载是为类型实现std::ops::Add等特征的add方法;用format!宏返回格式化的String

可以直接使用特征对象参数而不用泛型 Mesg:&impl Summary，形参要求实现Summary特征的类型的引用，可见impl < trait> work as a type这实际上是泛型的语法糖！不是特征对象；也可以< T: Summary>..Mesg:&T要求泛型满足Summary

Box< dyn < trait>>是一个类型;特征对象的数组类型需要手动指出，自动推导可能有问题；dyn trait表示一个“运行时决定具体类型”的 trait 对象类型，只能放在指针中；

一个特征能变成特征对象，首先该特征【只关心这个特征的定义】必须是对象安全的，即该特征的所有方法都必须拥有以下特点：返回类型不能是 Self[vtable中函数指针不能确定返回值类型]; 不能使用泛型参数[vtable中只能存储一个指针，泛型展开多个指针];避开本限制的方法是特征对象，通过返回一个本特征的特征对象来避免vtable不确定

关联类型：trait内声明的占位类型，可以视为"抽象成员类型"【但具体值由实现impl决定】，改善可读性
在trait内以Self::A使用；impl中指定type A=i32
为什么要使用关联类型而不是泛型？泛型实际实现了多个trait，语法上可以为一个strcut实现多种泛型的trait，但语义上这样不正确【不应该对vec< i32>实现string的Iterator】；而使用关联类型可以避免这一情况，因为实际上只有一个trait，关联类型是trait的一部分

impl带有泛型的trait/fn时，< T>紧跟在impl后【impl< T>】;默认泛型参数< T=i32>;完全限定语法来指定某个struct实现的不同trait中同名fn，注意需要传入本实例< Trait>::< method>(< obj>)

SUpertrait:通过要求实现< traitA>必须先实现< traitB>达到类似继承【有traitA方法的实例一定也实现了traitB方法】的效果： trait < traitA>:< traitB>+< traitC>{}

定义一个包裹原struct的newtype元组结构体，来避免orphan-rule在外部类型实现外部特征

所有的切片都是动态类型，它们都无法直接被使用，而 str 就是字符串切片，[u8] 是数组切片

vec!(..) 和 vec![..] 是同样的宏，宏可以使用 []、()、{}三种形式;struct1实现了From< T>特征则允许T转换为struct1,通过let v1:struct1=struct1::from(< T>)和let var:struct1=< T>.into()

对一个迭代器的引用，clone克隆迭代器；cloned克隆每个元素；vec的len是实际长度，capacity是最大长度

HashMap的key需要实现Eq和Hash[bool\int\uint\Strring\&str\实现了Eq和Hash的元素的集合];with_capacity()\shrink()都会调整大小，但不一定精确调整到输入参数，而是一个大于等于输入参数的值；可以通过let mut hash: HashMap<_, _, BuildHasherDefault< XxHash64>> 使用社区的哈希函数

对于实现了 Copy 特征的类型，例如 i32，那类型的值会被拷贝到 HashMap 中。而对于有所有权的类型，例如 String，它们的值的所有权将被转移到 HashMap 中

Rust不为基本类型提供隐式类型转换，只能显式转换
decimal as i32;注意f32只能先转换为u8再转换为char，不能直接转换; 从 Rust 1.45 开始，当浮点数超出目标整数的范围时，转化会直接取正整数取值范围的最大或最小值;as只允许有限的几种转换

*i32/*mut i32/*mut [u32]裸指针【指向i32/u32切片】，可以从array.as_mut_ptr()中取得，可以从借用&mut < array>[0] as \*mut i32类型转换；裸指针不受借用检查约束；

unsafe{...}告诉编译器由我来保证安全，不用静态验证；改变裸切片指针的切片类型，不会改变他的ptr和len，但是会改变size_of_val认为这一切片的大小【元素大小改变，导致元素大小*len变化】

From特征允许让一个类型定义如何基于另一个类型来创建自己；From 和 Into 是配对的，我们只要实现了前者，那后者就会自动被实现：只要实现了 impl From< T> for U[其中的fn from]， 就可以使用以下两个方法: let u: U = U::from(T) 和 let u:U = T.into()，into()需要显式类型标注

错误传播运算符?用于简化Result/Option错误处理
在类型为Result/Option的表达式后加?，表示在取值为OK时返回val，否则结束函数return Err；注意这里存在Err到函数返回类型的自动类型转换
特征TryFrom< T>中try_into()和try_from()返回Result()对象，可以借此通过match根据转化成功与否进行错误处理

fmt::Display特征用于实现格式化输出"{}"，实现fmt::Display::fmt(&self,f:&mut fmt::Formatter< '_>)->fmt::Result 的同时实现to_string()方法；write!(f,"{}",< value>)等价于f.write(...)向格式化器Formatter写入格式化字符串

可以用"32".parse::< i32>()从字符串解析i32,也可以i32::from_str("20");这是因为为i32实现了FromStr::from_str(s:&str)->Result< Self,Self::Err>

std::mem::transmute 是一个 unsafe 函数，可以把一个类型按位解释为另一个类型，其中这两个类型必须有同样的位数( bits ); std::mem::transmute::< \*const (), fn() -> i32>(pointer)；更可以扩展或缩短生命周期

当出现 panic! 时，程序提供了两种方式来处理终止流程：栈展开和直接终止
其中，默认的方式就是 栈展开，这意味着 Rust 会回溯栈上数据和函数调用，因此也意味着更多的善后工作，好处是可以给出充分的报错信息和栈调用信息，便于事后的问题复盘。直接终止，顾名思义，不清理数据就直接退出程序，善后工作交与操作系统来负责

注意Result< T,Err>有两个泛型参数；map和and_then可以对Result对象进一步操作 n_str.parse::< i32>().map(|n| n+2)以及 n_str.parse::< i32>().and_then(|num| Ok(num +2)),map自动为|..|后解构包裹Ok,and_then返回原值

可以起类型别名方便表达：type Res< T>=std::result::Result< T, ParseIntError>;
可以令main返回Result< >对象

#### 2026年3月3日

package项目，crate包；在main.rs、lib.rs中声明mod的模块视为main/lib的crate-root的子模块；同时两处声明则各自实现一份；作为文件夹的crate需要实现mod.rs包含子模块的声明
同时存在main和lib时，自动将lib以与package同名的名称导入main，main中use < package-name>::来调用lib作为crate-root下的内容
可以让crate只对特定crate可见，pub(in crate::< name>)

## Rust 高级进阶

### 生命周期进阶

生命周期：引用的有效作用域，它避免悬垂引用的作用显而易见【{}外定义的变量在{}内取值后，不能在{}外继续使用】；borrow-checker检查借用类型的变量的作用域，和他借用的对象的作用域，前者应当小于等于后者

经典例子longest-length-string报错，是因为无法确定返回值【一个引用】的借用对象的作用域，从而不知道对于函数返回值所在的作用域中，如何进行borrow_check；

函数的返回值如果是一个引用类型，那么它的生命周期只会来源于：函数参数的生命周期，或者函数体中某个新建引用的生命周期

包含引用属性的struct也有生命周期，是为了保证结构体的作用域小于等于被引用对象的作用域；为这样的结构体实现方法时，也需要使用生命周期标注；生命周期约束语法where 'a:'b表示a比b活得久

对于函数的生命周期，重要的是返回值的生命周期，因为要检查接受返回值的借用类型变量与被借用的对象的作用域
注意生命周期标注是泛型的一种

reborrow从一个借用派生的借用，rustc保证源借用生命周期大于派生借用的生命周期；允许源引用和子引用都是同一对象的可变引用，此时不允许在子引用的生命周期内使用源引用，但是源引用仍然存在

调用方法时如果存在self参数，虽然不显式写出，但是实际上的函数栈中自动写入这个self参数；如果返回值&Self是参数&mut self通过类型转换得到的reborrow，虽然返回值是&Self,但是会保持这个可变借用，不允许后续出现其他借用【包括方法调用，因为包括对self的引用】

move可以被视为“浅拷贝”，拷贝栈上metadata和ptr，并把原先栈上结构失效；

无界生命周期：出现在unsafe代码对裸指针的deref解引用，要尽量避免

```rs
fn f< 'a, T>(x: *const T) -> &'a T {
    unsafe {
        &*x
    }
}
```

生命周期约束与HRTB：生命周期只存在于编译期，是rustc用于保证借用安全的静态检查规则
生命周期约束：通过'a:'b和'T:a表示前者比后者生命周期长，在这种情况下，前者可以转换为后者；实际上rust对函数和闭包实现了两种不同的生命周期消除规则，导致let closure_slision = |x: &i32| -> &i32 { x };不能直接使用因为不认为返回值与参数是一个生命周期
生命周期约束可以消除如下：

```rs
// Rust 2015
struct Ref< 'a, T: 'a> {
    field: &'a T
}

// Rust 2018
struct Ref< 'a, T> {
    field: &'a T
}
```

HRTB：一般的生命周期标注是函数参数的泛型，HRTB给出对传入参数需要满足的trait的约束，用于传递闭包参数时约束这个闭包参数

```rs
fn apply< F>(f: F)
where
    F: for< 'a> Fn(&'a str)
{..}
```

NLL【非词法生命周期】规则：引用的生命周期从借用开始一直持续到最后一次使用的地方，生命周期不再严格等于代码的词法作用域

生命周期消除规则补充：
impl块为带有生命周期标注的struct实现它不使用生命周期标注的方法时，可以用匿名生命周期
impl Reader for BufReader< '_> {
    // methods go here
}

region更大的生命周期不可变引用可以转化为lifetime更小的不可变引用；可变引用理论上也允许转为lifetime更短的引用，但rust用reborrow实现：创建更短的生命周期引用，并冻结原先引用

borrow-checker实际上在根据约束求解每个借用所在的region；如果有解则通过check，无解则不通过；
对引用的deref,只要不赋值不会导致所有权转移

&'static与T:'static: 前者描述引用类型的特点，后者相对更灵活可以描述各种数据
前者用于描述引用类型本身在运行期间有效

```rs
fn get_str_at_location(pointer: usize, length: usize) -> &'static str {
  // 使用裸指针需要 `unsafe{}` 语句块
  unsafe { from_utf8_unchecked(from_raw_parts(pointer as *const u8, length)) }
}
```

后者描述类型T内不包含非'static引用，T本身需要是'static;配合fn print_it< T: Debug + 'static>( input: &T) {..}则可以接受临时变量let r="string";，因为str:'static而不是&str:'static

### 函数式编程：闭包与迭代器

函数式编程特性：闭包\模式匹配\迭代器\枚举类型
闭包是一种匿名函数，它可以赋值给变量也可以作为参数传递给其它函数，不同于函数的是，它允许捕获调用者作用域中的值[常用于当前作用域局部使用]：

```rs
fn main() {
   let x = 1;
   let sum = |y| x + y;

    assert_eq!(3, sum(2));
}
```

闭包可以将多次类似的传参调用简化，通过使用作用域内的值;闭包的一般形式如下：
|param1, param2,...| {
    语句1;
    语句2;
    返回表达式
}

相比需要显式标注的函数类型，闭包不需要标注参数和返回值的类型【因为不会作为API对外提供】；闭包不是泛型，当编译器推导出一种类型后，它就会一直使用该类型：

```rs
let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5);
```

以上程序报错，因为let s句推导闭包参数x的类型是String，然后后续传入u32；

可以用特征约束的方式，要求泛型参数是闭包类型【注意这里说的是各种闭包类型实现了的特征，因为每一个闭包都有自己的类型【即使签名一样】；Fn(u32)->u32是若干闭包都会实现的特征】：

```rs
struct Cacher< T>
where
    T: Fn(u32) -> u32,
{
    query: T,
    value: Option< u32>,
}
```

因为实际上Rustc会把闭包编译为单元结构体+trait实现，每个闭包对应一个单元结构体，实现了对应的Fn(..)->..特征；如果使用了当前作用域内的变量，则会存储借用/可变借用/值到结构体内

闭包也具有所有权，调用闭包实际上是调用这个结构体的方法；self\&self\&mut self三种参数，对应FnOnce\Fn\FnMut特征
如果FnOnce闭包实现Copy特征，则self时可以复制而不move，从而可以多次调用

这三个特征主要用于指定函数/struct参数类型，而不是定义闭包【定义闭包时，闭包特征和结构体属性的类型 由rustc根据函数体内容需要自动推导】
闭包根据函数体内对捕获值的操作决定使用什么方式,在定义时按照最小需要权限捕获值/不可变引用/可变引用
另外，FnOnce通过self参数强制只能调用一次

move关键字可以移动外部变量的所有权进入闭包(move || {..})

闭包根据函数体内对捕获值的处理方式，自动渐进地实现三个trait：Fn 的前提是实现 FnMut，FnMut 的前提是实现 FnOnce
所有的闭包都自动实现了 FnOnce 特征，因此任何一个闭包都至少可以被调用一次
没有移出所捕获变量的所有权的闭包自动实现了 FnMut 特征[这是为了防止多次调用反复移动所有权]
不需要对捕获变量进行改变的闭包自动实现了 Fn 特征

- 如果我们要做的事情不需要从环境中捕获值，则可以在需要某种实现了 Fn trait 的东西时使用函数而不是闭包。举个例子，可以在 Option< Vec< T>> 的值上调用 unwrap_or_else(Vec::new)【where F:FnOnce()->T】，以便在值为 None 时获取一个新的空的 vector。编译器会自动为函数定义实现适用的 Fn trait

迭代器 Iterator
迭代器允许我们迭代一个连续的集合，例如数组、动态数组 Vec、HashMap 等，在此过程中，只需关心集合中的元素如何处理，而无需关心如何开始、如何结束、按照什么样的索引去访问等问题

rust的迭代器基于Iterator特征[允许通过next()【迭代器的next返回Option】遍历]，实现IntoIterator特征的类型可以类型转换为迭代器，也可以.into_iter()显式转换为迭代器；Iterator也实现了IntoIterator特征，从而可以对迭代器对象调用Into_iter()返回自身

惰性初始化：创建迭代器时不会立刻进行任何计算，只有真正消费元素时才执行计算
迭代器时实现了Iterator特征的struct，允许通过next()遍历，返回包含关联类型Item的Option，next()对迭代器是消耗性的，当迭代器中没有元素，返回None；
for循环是迭代器的语法糖

into_iter()夺走原集合类型的元素所有权，iter()借用，iter_mut()可变借用，都在IntoIterator特征中实现

消费者与适配器【Adaptor指的是类型转换的机器】

- 消费者是迭代器上的方法，它会消费掉迭代器中的元素，然后返回其类型的值，这些消费者都有一个共同的特点：在它们的定义中，都依赖 next 方法来消费元素，因此这也是为什么迭代器要实现 Iterator 特征，而该特征必须要实现 next 方法的原因

消费者适配器：迭代器上在内部调用next()的方法称为消费者适配器，因为他会消耗迭代器的元素，返回单个元素
迭代器适配器：迭代器上的方法，返回一个新的迭代器；由于迭代器适配器是惰性的【这意味着不会在调用迭代器适配器时消耗原迭代器，而是会在调用next时取得元素并执行输入的闭包返回新值】，需要一个消费者适配器来收尾，最终将迭代器转换成一个具体的值，否则会报错

collect()消费者适配器需要指定收集的目标类型、filter迭代器适配器过滤闭包返回true的元素，.zip(< iter>)迭代器适配器将两个迭代器的内容压到一个二元组中【长度取短】，enumerate()迭代器适配器产生(idx,elem)的迭代器

Iterator特征的其他方法总是通过next()默认实现，所以为一个新类型实现Iterator只需要关联类型Item和next方法；

迭代器是 Rust 的 零成本抽象（zero-cost abstractions）之一，意味着抽象并不会引入运行时开销

### 深入类型

#### 2026年3月11日

as进行基本数值类型的转换，注意数据类型本身的表示范围；转换不具有传递性 就算 e as U1 as U2 是合法的，也不能说明 e as U2 是合法的（e 不能直接转换成 U2）；try_into()方法返回Result捕获类型转换中的错误

rust存在指针类型，对通过指针进行的值修改不进行borrow-check；借用&T是与指针\*T并行的另一套访问逻辑，另一套类型；借用可以as转化为裸指针,数组或切片调用as_mut_ptr()方法返回\*mut T;

所有权管理数据的拥有、move、drop，borrow-check检查可变引用和不可变引用的数量；通过借用&和指针\*访问都不会移动所有权

如果要使用一个特征的方法，那么需要引入该特征到当前的作用域中；对传入泛型参数的特征约束，发生在隐式类型转换前【一个类型 T 可以强制转换为 U，不代表 impl < U implemented traits\> 的特征约束可以接受 T】

点操作符的自动类型转换尝试：调用方法前决定使用什么接受器[self/&self/&mut self]作方法的输入
使用完全限定语法逐层次调用，完全限定语法用于指定任何函数/方法调用：< Type as Trait>::function(receiver_if_method, next_arg, ...);

- 不妨设调用者的类型为T，调用方法foo
- 首先，编译器检查它是否可以直接调用 T::foo(value)，称之为**值方法调用**
- 如果上一步调用无法完成(例如方法类型错误或者特征没有针对 Self 进行实现，上文提到过特征不能进行强制转换)，那么编译器会尝试增加自动引用，例如会尝试以下调用： < &T>::foo(value) 和 < &mut T>::foo(value)，称之为**引用方法调用**
- 若上面两个方法依然不工作，编译器会试着解引用 T ，然后再进行尝试。这里使用了 Deref 特征 —— 若 T: Deref< Target = U> (T 可以被解引用为 U)，那么编译器会使用 U 类型进行尝试，称之为**解引用方法调用**
- 若 T 不能被解引用，且 T 是一个定长类型(在编译期类型长度是已知的)，那么编译器也会尝试将 T 从定长类型转为不定长类型，例如将 [i32; 2] 转为 [i32]
- 如果还不行，报错

Rust在编译时保证对象调用的方法存在且唯一；

array[0]是特征Index的语法糖，等价于 array.index(0)；clone()传入一个借用&T输出T，对所有借用类型R实现了clone特征【类型R实现Clone特征，则定义一个输入为&R的clone方法返回R】

经过实验和查阅文档，总结method-call的顺序如下：
从当前类型U开始不断尝试deref【需要当前类型有deref方法】，如果停下来【没有deref了】则尝试unsize-coersion，这里得到L1类型序列
逐个考虑L1中的类型T，依次考虑receiver为T、&T、&mut T的同名方法；考虑单个receiver时先考虑固有方法，再考虑trait方法[各trait内receiver为T、&T、&mut T的方法都考虑，如果两个trait中出现同名同receiver方法则报错]
但如果当前考虑的类型T在当前作用域中是一个类型参数【泛型】，则T上trait-bound内的方法在一切方法之前考虑;如果有多的trait-bound，他们涉及的若干方法先进行一次上述匹配尝试

impl块只是提供了统一的self代指对象，真正选择方法还是要逐个方法看；只关心有无receiver匹配的方法，由谁[&self\self\&mut self]的trait实现不关心;泛型无法调用inherent-method

```rs
#[derive(Clone)] 
struct Container< T>(Arc< T>);
// derive宏 只是尝试派生，对于复杂类型，需要它内部的所有子类型都能进行 Clone；宏展开如下：

impl< T> Clone for Container< T> where T: Clone {
    fn clone(&self) -> Self {
        Self(Arc::clone(&self.0))
    }
}
```

关于泛型的特征实现，要在当前语境内看之前若干impl；下例考虑Container< i32>,因为i32实现clone，所以Container< i32>实现clone；Container< T>因为没有约束T实现clone，所以不为Container< T>实现clone，从而只能匹配引用的clone

```rust
#[derive(Clone)]// 宏派生的代码见上
struct Container< T>(Arc< T>);

fn clone_containers< T>(foo: &Container< i32>, bar: &Container< T>) {
    let foo_cloned :Container< i32>= foo.clone();
    let bar_cloned :&Container< T>= bar.clone();
}
```

main所在作用域有preclude导入若干trait，从而可以搜索到若干特征方法

具体见 [https://doc.rust-lang.org/reference/expressions/method-call-expr.html]

mem::transmute< T, U> 将类型 T 直接转成类型 U，要求这两个类型占用同样大小的字节数；mem::transmute_copy< T, U>从 T 类型中拷贝出 U 类型所需的字节数，然后转换成 U

如果没有指定返回类型，则很有可能发生UB，将 & 变形为 &mut 是未定义的行为，变形为一个未指定生命周期的引用会导致无界生命周期

\#[repr(C)] 按照C语言标准排列struct内部数据；\#[repr(transparent)]保证一个包含单个字段的结构体，在内存布局、ABI（应用二进制接口）和调用约定上，与其内部的那个字段完全一致

newtype【元组结构体】：为外部类型添加外部特征、更好的可读性和类型区别【防止意义不同但用相同类型表示的值运算、隐藏内部类型细节【不允许直接调用内部对象的方法】】
类型别名Type Alias:关键字type < alias>=< true-type-name>，用于改善可读性，减少复杂类型的重复描述

->!检查是否存在函数开始到结束的可达路径，如果没有则通过rustc；panic!返回！表示不会返回任何值，可以匹配任何返回值要求；内部没有break的loop认为返回!

定长类型Sized与不定长类型DST/unsized
因为编译器无法在编译期获知DST类型大小，若你试图在代码中直接使用 DST 类型，将无法通过编译【应当使用DST的引用通过编译】
DST: slice\str\特征[对象]\递归类型【在定义中使用自身】等
Rust 保证我们的泛型参数是固定大小的类型，因为编译器自动帮我们加上了 Sized 特征约束< T:Sized>;如果希望使用DST，可以< T:?Sized>(t:&T),仍然不能直接传入大小不确定的值

Box< str> 在内存中表示为胖指针，包含数据指针和长度元数据,即需要提供引用位置和内存占用长度才可以创建Box【特征对象dyn Trait的机制与此不同，不需要特征对象的size，而是使用[堆地址|vtable]存储】，需要能在栈上确定然后移动到heap

枚举和整数转换
Rust不提供直接的隐式转换i32/u32=>enum，但是允许通过as将enum转换为i32/u32;可以使用第三方库num-traits/num-derive/num_enums中方法实现转换；可以通过为enums实现from/try_from特征[通过将enum显式转化为i32实现比较]

```Rust
use std::convert::TryFrom;
impl TryFrom< i32> for MyEnum {
    type Error = ();

    fn try_from(v: i32) -> Result< Self, Self::Error> {
        match v {
            x if x == MyEnum::A as i32 => Ok(MyEnum::A),
            x if x == MyEnum::B as i32 => Ok(MyEnum::B),
            x if x == MyEnum::C as i32 => Ok(MyEnum::C),
            _ => Err(()),
        }
    }
}
```

如果认为以上过程太繁琐，可以定义一个宏自动为枚举类型生成impl Tryrom块，具体参考宏定义方法，案例如下：

```Rust
macro_rules! back_to_enum {
    ($(#[$meta:meta])* $vis:vis enum $name:ident {
        $($(#[$vmeta:meta])* $vname:ident $(= $val:expr)?,)*
    }) => {
        $(#[$meta])*
        $vis enum $name {
            $($(#[$vmeta])* $vname $(= $val)?,)*
        }

        impl std::convert::TryFrom< i32> for $name {
            type Error = ();

            fn try_from(v: i32) -> Result< Self, Self::Error> {
                match v {
                    $(x if x == $name::$vname as i32 => Ok($name::$vname),)*
                    _ => Err(()),
                }
            }
        }
    }
}
```

在 Rust 中，如果你不显式指定，编译器会根据枚举中值的范围自动选择一个它认为最高效的底层类型，此时猜rustc使用什么类型存储，并使用transmute是不安全的，应当为enum加#[repr(i32)]强制要求使用i32存储枚举值

```rust
#[repr(i32)]  // 强制底层使用 4 字节有符号整数
enum MyEnum {
    A = 1,
    B = 2,
}
```

#### 2026年3月13日

智能指针：引用【借用】也可以视为指针的一种，裸指针、智能指针也视为指针
Rust 的借用（引用）完全不记录被借用对象的任何元数据，只记录一个原始指针，这是为了实现零成本抽象；智能指针则记录了长度等meta-data，常常实现了Deref用于取内容，实现了Drop用于自动做清理工作；这里对以下内容展开叙述：

- Box< T>，可以将值分配到堆上
- Rc< T>，引用计数类型，允许多所有权存在
- Ref< T> 和 RefMut< T>，允许将借用规则检查从编译期移动到运行期进行

> 在 Rust 中，main 线程的栈大小是 8MB，普通线程是 2MB，在函数调用时会在其中创建一个临时栈空间，调用结束后 Rust 会让这个栈空间里的对象自动进入 Drop 流程，最后栈顶指针自动移动到上一个调用栈顶，无需程序员手动干预，因而栈内存申请和释放是非常高效的

Box可以保证不发生栈上大规模数据的复制【栈上数据实现了copy特征，赋值时直接复制一份内容，堆上内容在赋值时只复制指针】;不允许直接通过[]语法移动所有权【container[index] is actually syntactic sugar for *container.index(index)，所以你无法通过一个借用移动所有权】

Box的关联函数Box::leak(x)将< Box>x消耗掉，返回保护的heap空间的裸指针【通常是'static的】；人为导致内存泄漏【因为rustc的drop不再自动释放这块heap-space】，但是得到了一个'static的引用【如果需要一个在运行期初始化的值，但是可以全局有效，也就是和整个程序活得一样久，可以用leak】

deref解引用：如果没有deref，rustc实际上只能对指针使用\*；对于实现deref特征的y，\*y实际上等价于\*(y.deref()),这是希望不要通过deref获取智能指针保护对象的所有权

> When we entered \*y in Listing 15-9, behind the scenes Rust actually ran this code: \*(y.deref())

传递参数时也会发生deref：当需要特定的引用类型Target，而T实现了Deref< Target=Target>,则会有&T=>&Target,通过调用deref【T=>Target】具体如下;甚至可以实现连续的隐式 Deref 转换，只要存在若干个deref链即可【注意以下的Target是特征Deref的关联类型，deref返回类型一般是&Target】

> 包括可变解引用DerefMut和不可变Deref，实现前者必须先实现后者【特征依赖】
> From &T to &U when T: Deref< Target=U>
> From &mut T to &mut U when T: DerefMut< Target=U>
> From &mut T to &U when T: Deref< Target=U>

core库对任意类型的引用实现了Deref特征，从&T=>T【?Sized匹配变长的、定长的类型】

```rust
impl< T: ?Sized> Deref for &T {
    type Target = T;

    fn deref(&self) -> &T {
        *self
    }
}
```

Drop释放资源：在运行到作用域结束时，根据创建变量的倒序，结构体内的顺序【释放一个结构体，按内部字段顺序调用各字段类型的drop】运行这些对象的Drop::drop()函数【rustc为几乎所有类型实现了默认的Drop特征】
rust不允许显式地调用drop方法【析构函数】；但是可以使用drop函数拿走目标的所有权，在语法上阻止访问drop的对象

> drop函数的原理：事实上，能被显式调用的drop(_x)函数只是个空函数，在拿走目标值的所有权后没有任何操作。而由于其持有目标值的所有权，在drop(_x)函数结束之际，编译器会执行_x真正的析构函数，从而完成释放资源的操作。换句话说，drop(_x)函数只是帮助目标值的所有者提前离开了作用域

方法采用&mut self没有释放对象本身，在语法上不能阻止drop方法后再尝试读取；而这种&mut self设计避免了使用drop(self)，方法结束时self作为局部变量离开作用域，需要调用drop导致无穷递归

无法为一个类型同时实现 Copy 和 Drop 特征。因为实现了 Copy 特征的类型会被编译器隐式的复制，因此非常难以预测析构函数执行的时间和频率。因此这些实现了 Copy 的类型无法拥有析构函数

实现copy特征的类型在传参【move】时会进行位复制,Copy是一个标记特征（Marker Trait），无法修改它的行为；所以copy和drop互斥确实是正确的：实现copy的合理对象一定在stack上，随着栈帧的释放直接drop，用不到drop释放heap数据

> The behavior of Copy is not overloadable; it is always a simple bit-wise copy.

所有权系统确保引用总是有效的，也会确保 drop 只会在值不再被使用时被调用一次，无需担心意外的清理掉仍在使用的值，这会造成编译器错误

Rc与Arc：希望在堆上分配一个对象供程序的多个部分使用且无法确定哪个部分最后一个结束时，就可以使用 Rc 成为数据值的所有者

Rc是智能指针【Rc\Arc是指向底层数据的不可变的引用【符合Rust 的借用规则：要么存在多个不可变借用，要么只能存在一个可变借用】】，指向heap上的数据;Rc实现了deref特征，可以直接使用里面的T【字段访问时隐式逐层deref找对应field】
用对象创建Rc时，注意实际上是[移动到heap、创建引用]，引用计数自动自增1；用Rc::strong_count(&a)查看引用计数；Rc.clone()复制一份指针，在超出作用域后自动释放

由于Rc/Arc是不可变引用，需要搭配内部可变性类型或Mutex修改数据；thread捕获的变量必须实现Send特征表示线程安全

Cell和RefCell实现内部可变性【可以在拥有不可变引用/作为不可变对象的同时修改目标数据，内部使用unsafe实现】
Cell 和 RefCell 在功能上没有区别，区别在于 Cell< T> 适用于 T 实现 Copy 的情况,RefCell用于引用：
Cell.get取值，Cell.set设置；RefCell.borrow()作为借用，RefCell.borrow_mut()作为不可变借用；也可以对Cell对象作&

```rs
use std::cell::Cell;
fn main() {
  let c = Cell::new("asdf");
  let one = c.get();
  c.set("qwer");
  let two = c.get();
  println!("{},{}", one, two);
}
// asdf,qwer
```

RefCell实现编译期可变、不可变引用共存，但是运行时如果共存则panic; 通常用于借用关系复杂难以管理时使用，内部保护一个指针
Rc+RefCell实现多所有者和可变性，性能很高
Cell::from_mut和Cell::as_slice_of_cells将&mut转化为&Cell、将&Cell< [T]>转化为&[Cell< T>],从而允许简洁地用多个引用访问对象

### 循环引用

#### 2026年3月14日

默认模式绑定方式：如果match一个结构体的匹配，在没有显式使用&【明确解引用】或ref【明确绑定为引用】的情况下，会自动将模式中的匹配字段绑定为引用；认为通过引用进行匹配时，不能获取字段的所有权（Move）

循环引用导致Debug尝试展开所有字段打印时无穷递归打开，导致main函数栈溢出；同时rc在drop时减少一个引用计数，但是由于循环引用的存在，rc始终不为0,无法释放

弱引用Weak：不保证引用关系依然存在,不持有对象的所有权，不阻止释放
通过upgrade()方法创建了新的rc，返回Option< Rc< T>>：如果不存在，就返回一个 None，存在返回Some< Rc< T>>；Rc< T> 调用 downgrade 方法创建一个新的 Weak< T>；
对于父子引用，让父对子rc，子对父weak，解决循环调用无法释放

Rc::strong_count(&leaf),Rc::weak_count(&leaf)查询leaf< Rc>被strong/weak引用的数量【Rc在heap上维护一个类似结构，保存strong/weak reference count】

```rs
struct RcBox< T> {
    strong: Cell< usize>, // 强引用计数
    weak: Cell< usize>,   // 弱引用计数
    value: T,            // 实际存储的数据
}
```

自引用结构体：包含字段和字段的引用字段的结构体
在初始化一个自引用结构体时，总是会遇到借用与所有权移动的冲突，或者rustc认为引用比值生命周期更长，或者借用与可变借用冲突

> 案例见 [https://course.rs/advance/circle-self-ref/self-referential.html]

```rs
struct SelfRef< 'a> {
    value: String,

    // 该引用指向上面的value
    pointer_to_value: &'a str,
}

// 初始化时报错：borrow of a moved value
```

发生上述报错，可能的原因有生命周期没有约束、我们认为这里ptr不应该被检查而rustc检查；可选的解决方案是unsafe裸指针，因为裸指针不经过borrow-check【但是注意如果从fn返回一个自引用对象，如果value在stack，可能导致copy而裸指针地址outdate】

或者使用pin，pin包裹一个ptr，保证这个ptr指向的对象在内存中的位置不变，从而避免从函数返回时移动对象【这一功能Box作返回值就可以实现】，避免通过可变借用修改结构内容破坏一致性【pin禁止safely获取保存的ptr的整体&mut，但是允许获取字段的&mut,从而允许修改字段，不允许移动整体】

第三方库ouroboros等；也可以通过Rc+RefCell或Arc+Mutex

### 多线程并发

#### 2026年3月19日

多核心并发：M:N的处理模型，M线程N核心

> 如果某个系统支持两个或者多个动作的同时存在，那么这个系统就是一个并发系统。如果某个系统支持两个或者多个动作同时执行，那么这个系统就是一个并行系统。

编程语言的并发与操作系统线程的关系：语言内部可能实现自己的线程模型，语言内部构建M线程使用os的N的线程交替运行时，称为M：N线程模型;rust只在标准库中实现了1:1的线程模型

> 运行时是那些会被打包到所有程序可执行文件中的 Rust 代码，根据每个语言的设计权衡，运行时虽然有大有小（例如 Go 语言由于实现了协程和 GC，运行时相对就会更大一些），但是除了汇编之外，每个语言都拥有它，而绿色线程/协程的实现会显著增大运行时的大小
> 多线程的开销往往是在锁、数据竞争、缓存失效上，这些限制了现代化软件系统随着 CPU 核心的增多性能也线性增加的野心

thread::spawn创建线程，< handle>.join()阻塞当前线程等待handle结束；当主线程结束，释放它的所有子线程;Barrier::new(6)可以让多个线程都执行到某个点后，才继续一起往后执行【需要所有barrier都到达.wait()才允许线程继续】
thread_local宏初始化线程的局部变量，在线程内用VAR.with(fn)访问thread_local定义的局部变量VAR的引用，用with()保证引用不超出本线程的范围【超出后由于局部变量在线程结束后释放，导致悬垂引用】；thread_local!声明的变量的实际类型是localkey，localkey是全局静态的，通过.with()得到引用访问指向的数据【随线程销毁】
第三方库thread_local提供以线程 ID 为索引的并发哈希表（或数组），每个线程访问它的Arc时，分配一块空间供使用；所有子线程结束后仍然可以通过arc访问若干曾经申请的空间

condvar提供原子的“释放锁”+“进入休眠”,与mutex一起让线程挂起，直到条件发生再唤醒

```rs
use std::thread;
use std::sync::{Arc, Mutex, Condvar};

fn main() {
    let pair = Arc::new((Mutex::new(false), Condvar::new()));
    let pair2 = pair.clone();

    thread::spawn(move|| {
        let (lock, cvar) = &*pair2;
        let mut started = lock.lock().unwrap();
        println!("changing started");
        *started = true;
        cvar.notify_one();
    });

    let (lock, cvar) = &*pair;
    let mut started = lock.lock().unwrap();
    while !*started {
        started = cvar.wait(started).unwrap();
    }

    println!("started changed");
}
```

Once类型的call_once(fn)保证只调用一次call_once()，即使多个线程中同时调用call_once();sync::OnceLock类似把Once和数据存储在一起

消息通道：标准库channel mpsc::channel();
channel是泛型，只能传输相同类型的数据，如果用枚举类型则按照最大成员对齐；recv()阻塞进程直到读取到值或通道关闭，实际接受Result；try_recv()尝试接受一次消息，不阻塞，如果没有消息立刻返回错误Err(Empty)
使用channel会从sender到receiver移动所有权，有copy则调用copy；所有sender被drop后，在作用域末尾调用rx的drop关闭通道，如果还有tx.send()报错，当所有tx\rx都drop内存释放

mpsc::channel创建异步通道，send后不需要阻塞等待recv读取,缓存取决于内存大小；sync::channel::new(N)创建带指定条消息缓存的同步通道，如果已经存在N条未读取消息，会阻塞等待recv读取，读取后允许send【如果N=0,send会阻塞等待recv()调用】

线程同步：锁、condvar和信号量
相比消息传递，通过内存共享更直接简洁，但是多所有权，锁管理更复杂

互斥锁Mutex：.lock()阻塞当前线程直到获取锁，当锁损坏返回错误Err，成功获取后返回Result< MutexGuard>；try_lock尝试去获取一次锁，如果无法获取会立刻返回一个错误，所以不会导致阻塞；MutexGuard是一个智能指针，实现deref方法的target是内部数据的引用【deref是从一个引用到另一个引用】，实现drop方法自动释放锁【unlock】

rc在多线程不安全，是因为内部计数器的修改是不安全的，可能有三个指针但count=2；关于内部可变性：Rc/RefCell用于单线程内部可变性， Arc/Mutex用于多线程内部可变性【所有内部不可变性源于unsafecell,和在这个cell上实现的deref/deref_mut】

Rwlock：允许并发读取，避免mutexlock每次都需要加锁，根据策略不同，对同时出现读写操作可以安排fifo/先写/先读；比mutex复杂，常用于高并发读取

condvar条件变量，.wait()让线程挂起，直到某个条件【对本Condvar调用notify相关方法】发生后再继续执行
semaphore信号量：用tokio提供的实现，用于控制最大async并发数量；信号量维护一个计数器，当计数器大于0,semaphore.acquire_owned()返回的future在await后立刻结束并登记；如果计数器等于0则.await则把线程交给其他调度器自己task阻塞

使用 #[tokio::main] 装饰 async fn main 把他变成了一个异步运行时的启动锚点：阻塞当前线程，直到所有异步函数完成【block_on只关心传入的future的返回值ready即可】

```rs
fn main() {
    // 1. 创建多线程运行时 (Runtime)
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap();

    // 2. 在运行时中执行你的异步 main 逻辑
    rt.block_on(async {
        // 你原本写在 async fn main() 里的代码...
    });
}
```

Atomic原子类型：无锁cas vs Mutex非阻塞等待
对于含有move的闭包，即使捕获static变量，只会捕获它的'static引用;AtomicU64 实现了 Sync,这意味着 &AtomicU64 是 Send 的,可以被多线程共享;atomic实现内部可变性，可以通过fetch_add等方法改变一个不可变对象的值

> 闭包实际形成一个结构体保存捕获的变量，并为结构体实现trait【Fn/FnOnce/FnMut】,trait中定义call_once函数，包裹闭包的函数体

内存操作顺序：以下关键字限制单个线程内内存操作的重排序程度

- Relaxed， 这是最宽松的规则，它对编译器和 CPU 不做任何限制，可以乱序
- Release 释放，设定内存屏障(Memory barrier)，保证它之前的操作永远在它之前，但是它后面的操作可能被重排到它前面
- Acquire 获取, 设定内存屏障，保证在它之后的访问永远在它之后，但是它之前的操作却有可能被重排到它后面，往往和Release在不同线程中联合使用【传递普通内存修改已经完成的信号，保证收到信号时内存一定修改完成，使用信号量保护的内存的操作一定发生在信号量收到之后】
- AcqRel, 是 Acquire 和 Release 的结合，同时拥有它们俩提供的保证。比如你要对一个 atomic 自增 1，同时希望该操作之前和之后的读取或写入操作不会被重新排序【原子操作同时拥有读取和写入的功能用AcqRel】
- SeqCst 顺序一致性， SeqCst就像是AcqRel的加强版，在acqrel对本线程的要求上，更要求不同线程看到SeqCst的顺序一样，存在一个全局【所有线程】统一的SeqCst操作顺序

常用Arc配合Mutex/Atomic：arc用于保障所有权不被提前释放，允许多个持有者；互斥锁/原子类型保障数据修改不冲突/竞态

> Rust 通过两个特殊的标记 Trait（Marker Traits）来管理跨线程安全：若类型 T 的引用&T是Send，则T是Sync
> Send：允许一个类型的所有权在线程间转移（Move），这是为了预防未来的不安全行为【如果一个变量于当前线程的某些状态"深度绑定"，则不能安全地转移所有权，例如rc如果存在clone，则不可以安全地转移到另一个线程，因为可能导致修改时竞态；例如使用了线程静态局部变量TLS的类型，移动后LocalKey访问另一个线程的变量；部分handle要求必须在当前thread内获取释放】
> Sync：允许一个类型的不可变引用在多个线程间共享【同上，凡是来自不同线程的访问会导致不安全行为的类型，它的引用不可以在多个线程中共享，例如没有实现原子修改的内部可变性类型】

thread::spawn 要求闭包必须实现 Send，也就要求其中捕获的变量必须实现Send[这是显然的]; 可见send只决定类型在线程间移动【只有持有的线程可以房屋呢】，sync的类型可以由多个线程访问

在 Rust 中，几乎所有类型都默认实现了Send和Sync，而且由于这两个特征都是可自动派生的特征(通过derive派生)，意味着一个复合类型(例如结构体), 只要它内部的所有成员都实现了Send或者Sync，那么它就自动实现了Send或Sync
裸指针没有实现send/sync,unsafecell没有实现sync，rc没有实现send/sync; Send/sync特征是unsafe特征，impl时要"unsafe impl send for < type>"

### 全局变量

#### 2026年3月20日

编译期初始化：在编译期得到具体变量的具体值，不允许调用函数进行初始化【仅限于constant funcs】
静态常量const：必须指出类型；可以在任意作用域进行定义，会内联到代码中；不允许出现同名常量遮蔽；可以视为在每个调用处复制一份
静态变量static:必须用unsafe才可以访问修改【这需要声明时static mut】；不会内联，有自己的地址；要求必须实现sync；生命周期'static
原子类型：略

运行期初始化：使用第三方库lazy_static宏实现在运行期初始化，可以在第一次使用变量时调用函数初始化；在访问变量时会有性能损失，因为需要确认初始化是否完成；强制内部定义的变量类型都是 static ref

```rs
use std::sync::Mutex;
use lazy_static::lazy_static;
lazy_static! {
    static ref NAMES: Mutex< String> = Mutex::new(String::from("Sunface, Jack, Allen"));
}

fn main() {
    let mut v = NAMES.lock().unwrap();
    v.push_str(", Myth");
    println!("{}",v);
}
```

如果希望修改全局静态变量中的引用，常常会因为被引用对象生命周期不够'static导致报错；此时可以使用Box::leak将被引用对象的生命周期扩展到'static

现在Rust标准库提供Once/Lazy相关api提供lazy-init功能，配合static声明可以代替lazy-static功能
Once先声明变量【OnceLock/OnceCell初始化时没有传入fn】，通过get_or_init(fn)来运行fn进行初始化，后续访问也用get_or_init
Lazy按照LazyLock::new(fn)初始化时传入的方法在第一次使用时进行初始化
oncelock/lazylock用于多线程触发，oncecell/lazycell用于单线程；
对于静态变量，once的实现可以更灵活地初始化，不需要在编译时确定，可以传入参数，但会带来更麻烦的调用过程；lazy在编译时确定延迟初始化的过程，但是使用更方便；实际上lazylock基于oncelock，额外存储闭包和实现deref特征

### 错误处理

#### 2026年3月20日 continue

如何处理Result和Option，定义错误类型

- 组合器进行短路运算并给出结果,输入Option/Result,输出Option/Result
- < option>.or(< option>)，表达式按照顺序求值，若任何一个表达式的结果是 Some 或 Ok，则该值会立刻返回; 否则返回最后一个Err/None
- < option>.and(< option>)，若两个表达式的结果都是 Some 或 Ok，则第二个表达式中的值被返回。若任何一个的结果是 None 或 Err ，则立刻返回。
- < option>.or_else(< fn>),用fn返回的Option/Result进行比较
- < option>.and_else(< fn>),用fn返回的Option/Result进行比较
- < option>.xor(< option>),**只能用于option**, some和None各一个时返回那个some，否则返回None

- 其他Option方法：注意所有权
- < option>.filter(< fn>),只能用于Option；如果None直接返回None，否则匹配包裹的值进入fn，fn返回true则filter返回Some，fn返回false则filter返回None; 会消耗调用者【self作为receiver】
- .map(< fn>)将some/ok中的值通过fn映射为另一个值，对None/Err不处理；.map_err(< fn>)将Err中的值映射为另一个值，不修改ok的值；会消耗调用者【self作为receiver】
- .map_or(V_DEFAULT,< fn>),如果是None/Err则返回V_DEFAULT,否则返回some/ok中的值经过fn的当前值，不会修改原值；会消耗调用者【self作为receiver】
- .ok_or将Option转化为Result，需要输入err参数；.ok_or_else传入返回err的闭包
- .as_ref()创建新的option,从Option< T>创建Option< &T>,不会消耗原option

_or方法是eager_evaluate不会短路，_or_else是lazy_evaluate会短路；前者也可以传入闭包，后者必须传入闭包

自定义错误类型：传入Err(e)的参数什么特征也不需要实现；Debug+Display使这个错误能print【display匹配{},debug匹配{:?}】;支持Error特征可以使用自动类型转换、支持链式调用source用dyn Error实现特征对象

```rs
impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 把formatter理解为流式输出的输出端，往里写入格式化字符串
        let err_msg = match self.code {
            404 => "Sorry, Can not find the Page!",
            _ => "Sorry, something is wrong! Please Try Again!",
        };

        write!(f, "{}", err_msg)
    }
}
```

为自定义错误实现From特征后，可以转换系统错误类型为自定义错误类型【?和.into()可以隐式转换】

```rs
#[derive(Debug)]
struct AppError {
    kind: String,
    message: String,
}

impl From< io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError {
            kind: String::from("io"),
            message: error.to_string(),
        }
    }
}

fn main() -> Result< (), AppError> {
    let _file = File::open("nonexistent_file.txt")?;
    Ok(())
}

```

归一化错误类型：特征对象、自定义错误类型、thiserror
实现Error特征的类型，在标准库中有令Error对象转化为Box< dyn Error>的，Box< dyn Err>类型上的from特征，接受有Error的类型；由此可以实现从Error特征的类型到Box< dyn Error>特征类型的转化；这种解决办法依赖内部所有错误类型实现了Error特征

```rs
fn render() -> Result< String, Box< dyn Error>> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}
```

自定义特征类型：为所有涉及的错误类型，在自定义错误上定义接受这些错误的From特征与方法[impl特征后，如果内部方法没有重写就用默认实现,从而可以实现From特征下from函数外的方法如into()]

thiserror、error-chain等第三方库
前者用枚举类型简化自定义特征，后者定义宏简化定义

### unsafe-programming

#### 2026年3月22日

由于系统编程的需要，unsafe是必需的

- unsafe的代码块可以在执行以下内容时放弃内存安全检查
- 解引用裸指针
- 调用一个 unsafe 或外部的函数
- 访问或修改一个可变的静态变量
- 实现一个 unsafe 特征
- 访问 union 中的字段

裸指针可以同时具有数据的可变和不可变指针，绕过borrow-check；可以不保证指向的内存合法，不实现自动drop
对引用使用as \*const可以创建指针，对usize作as \*const也可以创建裸指针【rustc会允许通过编译检查，但是如果访问无权访问的地址会运行时报错】；创建裸指针是安全的行为，而解引用裸指针才是不安全的行为【需要unsafe】
用*解引用裸指针，注意裸指针直到它指向的对象类型【 \*const i32】所以可以解引用实现取值
unsafe fn声明的函数，必须在unsafe块中调用；函数包含了 unsafe 代码不需要将整个函数都定义为 unsafe fn

FFI（Foreign Function Interface）可以用来与其它语言进行交互，这是为了使用其他语言编写的库
通过extern块声明使用其他语言的函数，对这些函数的调用需要在unsafe块中，因为rustc无法检查这些函数
在函数声明前加入pub extern关键字创建接口允许其他语言调用，需要加#[no_mangle]保证函数名不变
第三方库rust-bindgen 和 cbindgen可以自动生成c-rust的接口【包括结构体定义和外部函数声明】；cxx负责cpp代码，miri产生中间结果支持LLVM后端，clippy检查unsafe

修改静态全局变量static也需要在unsafe块中；访问union字段是不安全的，常用于与C交互，需要在unsafe块中
unsafe特征出现在它的某个方法包含有编译器无法验证的内容，用unsafe trait和unsafe impl实现

内联汇编：通过asm!宏在unsafe块中嵌入汇编代码
asm!接受一个格式化字符串，允许使用out/in/inout关键字指出使用的寄存器以及绑定的变量【开始汇编前分配寄存器，对in把变量输入寄存器；执行后把out对应的寄存器内容写入对应的变量】【inout可以令输入输出对应两个不同的变量inout("rax") b => lo 】

asm! 允许使用多个格式化字符串，每一个作为单独一行汇编代码存在，看起来跟阅读真实的汇编代码类似；reg表示使用通用寄存器，也可以指定平台相关的特定寄存器【例如x86下的eax】

```rs
use std::arch::asm;

let i: u64 = 3;
let o: u64;
unsafe {
    asm!(
        "mov {0}, {1}",
        "add {0}, 5",
        out(reg) o,
        in(reg) i,
    );
}
assert_eq!(o, 8);

// Another example
unsafe {
    asm!("add {0}, 5", inout(reg) x => y);
}
```

lateout是说，写入这个out寄存器的操作，一定发生在所有in寄存器被读取之后，从而允许这个out寄存器在被写入之前复用【由于rel编译存在若干优化，在late下可能以各种方式【例如两个变量值相同用同一个寄存器存储】复用这个寄存器，所以如果中途使用out存储中间结果可能导致中间结果丢失】
使用lateout/inlateout可以提高效率，但是要保证中途不用out寄存器参与中间运算【输出一定在所有输入读取之后】；相反，inout/out会保证out寄存器始终是独立的寄存器，从开始执行指令到指令完成始终是独立寄存器不复用

clobbered：内联汇编修改了out寄存器之外的寄存器，rustc需要保存和恢复这些修改的状态
对于会发生修改的寄存器，我们用out(“reg1”)_表示丢弃寄存器输出的结果，通知寄存器由于某条指令，虽然没有显示涉及寄存器"reg1"但是实际内容被修改
x86架构下rbx被LLVM编译器认为自己全权控制，如果asm!通过指令修改了ebx需要让它还原，可以通过push-pop

### Macro宏编程

#### 2026年3月22日 continue

宏的参数可以使用()、[]、{}传入；在 Rust 中宏分为两大类：声明式宏( declarative macros ) macro_rules! 和三种过程宏( procedural macros ):

- #[derive]，在之前多次见到的派生宏，可以为目标结构体或枚举派生指定的代码，例如 Debug 特征
- 类属性宏(Attribute-like macro)，用于为目标添加自定义的属性
- 类函数宏(Function-like macro)，看上去就像是函数调用

宏允许可变数量参数，但是语法更加复杂；

声明式宏：将源代码进行模式匹配，替换为特定代码；使用macro_rules! < name> {}定义宏, 用\#[macro_export] 导出宏

```rs
// 一个vec![]的简化表示

#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

()包裹整个宏模式，$() 中包含的是模式 $x:expr，该模式中的 expr 表示会匹配任何 Rust 表达式，并给予该模式一个名称 $x
因此 $x 模式可以跟整数 1 进行匹配，也可以跟字符串 "hello" 进行匹配: vec!["hello", "world"]
$() 之后的逗号，意味着若干参数之间使用逗号进行分割，* 说明之前的模式可以出现零次也可以任意次
宏的替换对象在=>后，$()*根据匹配次数生成重复代码

过程宏：使用源代码作为输入参数，基于代码进行一系列操作后，再输出一段全新的代码【过程宏的三种类型(自定义 derive、属性宏、函数宏)】
创建过程宏时，它的定义必须要放入一个独立的包中，且包的类型也是特殊的，这是因为过程宏实际上是rust函数，需要先编译才可以应用到代码文件，而Rust 的编译单元是包，所以需要放到独立包

以derive过程宏为例：
必须以 derive 为后缀，对于 hello_macro 宏而言，包名就应该是 hello_macro_derive。在之前创建的项目根目录下创建一个单独的lib包

> 学习过程更好的办法是通过展开宏来阅读和调试自己写的宏，这里需要用到一个 cargo-expand 的工具,通过cargo install cargo-expand安装

在项目的toml中加入以下内容，其中 syn 和 quote 依赖包都是定义过程宏所必需的，同时，还需要在 [lib] 中将过程宏的开关开启
[lib]
proc-macro = true

[dependencies]
syn = "1.0"
quote = "1.0"

然后在lib.rs中用#[proc_macro_derive(HelloMacro)]定义derive函数;对于绝大多数过程宏而言，这段代码往往只在 impl_hello_macro(&ast) 中的实现有所区别，对于其它部分基本都是一致的，如包的引入、宏函数的签名、语法树构建等

```rs
extern crate proc_macro;

use proc_macro::TokenStream;
use quote::quote;
use syn;
use syn::DeriveInput;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // 基于 input 构建 AST 语法树
    let ast:DeriveInput = syn::parse(input).unwrap();

    // 构建特征实现代码
    impl_hello_macro(&ast)
}
```

proc_macro 包是 Rust 自带的，因此无需在 Cargo.toml 中引入依赖，它包含了相关的编译器 API，可以用于读取和操作 Rust 源代码
由于我们为 hello_macro_derive 函数标记了 #[proc_macro_derive(HelloMacro)]，当用户使用 #[derive(HelloMacro)] 标记了他的类型后，hello_macro_derive 函数就将被调用。这里的秘诀就是特征名 HelloMacro
syn 将字符串形式的 Rust 代码解析为一个 AST 树的数据结构，该数据结构可以在随后的 impl_hello_macro 函数中进行操作。最后，操作的结果又会被 quote 包转换回 Rust 代码

```rs
// derive过程宏只能用在struct/enum/union上，考虑结构体的构成
// vis，可视范围             ident，标识符     generic，范型    fields: 结构体的字段
pub              struct    User            < 'a, T>          {

// vis   ident   type
   pub   name:   &'a T,

}
```

syn::parse 调用会返回一个 DeriveInput 结构体来代表解析后的 Rust 代码

```rs
DeriveInput {
    // --snip--
    vis: Visibility,
    ident: Ident {
        ident: "Sunfei",
        span: #0 bytes(95..103)
    },
    generics: Generics,
    // Data是一个枚举，分别是DataStruct，DataEnum，DataUnion，这里以 DataStruct 为例
    data: Data(
        DataStruct {
            struct_token: Struct,
            fields: Fields,
            semi_token: Some(
                Semi
            )
        }
    )
}
```

接下来考虑impl代码，使用quote!定义希望返回的rust代码，用.into()类型转换为TokenStream; stringify! 是 Rust 提供的内置宏，可以将一个表达式(例如 1 + 2)在编译期转换成一个字符串字面值("1 + 2")，该字面量会直接打包进编译出的二进制文件中，具有 'static 生命周期

```rs
fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let gen = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    gen.into()
}
```

类属性过程宏跟 derive 宏类似，但是前者允许我们定义自己的属性【允许定义并使用derive之外的名称】，并允许替换原代码；输入属性参数和被修饰的源代码
除此之外，derive 只能用于结构体和枚举，而类属性宏可以用于其它类型项，例如函数【要求在指定条件下调用函数】

```rs
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {}
```

类函数宏可以让我们定义像函数那样调用的宏，从这个角度来看，它跟声明宏 macro_rules 较为类似[但是过程宏可以实现更复杂的处理过程，又比函数调用在runtime的工作更少]
区别在于，macro_rules 的定义形式与 match 匹配非常相像，而类函数宏的定义形式则类似于之前讲过的两种过程宏:

```rs
#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {}
```

### async/await异步编程

#### 2026年3月14日 continue

异步编程是一个并发编程【concurrency，n个线程同时存在】模型，是实现并发任务的方式之一；其他语言中设计的并发模型包括：

- os线程【是以下所有模型的基础，以下所有模型都可以运行在单一的os线程上】
- Event-drive【若干任务event-loop等待信号量，通过信号量触发callback funciton，单线程非阻塞分发任务，共享堆栈】
- Coroutines/Green Thread协程【分配私有轻量栈、共享进程堆的伪线程和调度器，协程阻塞时自动抢占切换【这种二层的thread对用户透明，可以在协程中进行正常的函数调用】】
- actor模型【一个os线程上可以有多个Actor，每个Actor拥有独立堆栈，通过异步信息交流，并在ready时占用os线程】
- await/async【基于状态机的模型，一个os线程中维护若干个状态机【独立虚栈【保存所有变量到匿名结构体，没有栈帧导致不能随意退出，只能在await退出，也会带来内存安全问题】，共享堆】，执行到.await时返回状态Pending或Ready协作式让出线程】

在现代操作系统（如 Linux, Windows, macOS）中，调度的最小单位其实是线程；如果发现切换前后是同一个进程的线程，则不用切换虚拟页表，只需要切换context即可

Runtime 是一个后台管理系统，它负责监听外界信号并驱动任务运行；包括启动切换各task的调度器，接受信号通知waker的反应器

async标记的语法块被转换为实现了Future特征的状态机
async fn创建异步函数，返回值是一个future对象【futures do nothing unless you `.await` or poll them】；编译器会把async函数转化为返回匿名结构体的同步函数，结构体实现Future特征，把所有局部变量变成结构体的字段，并把函数体按await分开塞入future特征中的poll方法中

使用一个包装了await和poll的executor执行这个future对象，future库提供了若干种不同Executor；async 是懒惰的，直到被执行器 poll 或者 .await 后才会开始运行，其中后者是最常用的运行 Future 的方法

executor::block_on(< future>)阻塞当前线程直到指定的future运行完毕，不允许执行其他ready的task；在async fn函数中对future对象使用.await可以等待这个新对象异步调用完成但不阻塞当前线程：当< future>A.await会调用A.poll()，如果返回ready则继续运行，Pengding则登记高级waker到A中，并暂时中断当前task等待wake，线程转而执行其他任务

Future特征维护poll轮询方法，poll方法返回Ready< T>或Pending，且**只有当poll方法返回poll枚举对象后，调度器才运行其他task**
poll推进future对象的执行；future准备好继续运行【以发生中断/IPC调用本task的waker表示】，中断程序接受传入的wake将task移动到调度器的就绪队列

poll内链式调用本future的子future的poll时，实际上将子task的结构体嵌套在本task的结构体内，调度器获得父future的指针，waker唤醒的也是父future继续poll

异步函数在编译时被计算需要的最大内存并分配，之后执行时不需要runtime分配内存空间，不需要新分配栈；调度器维护一个由task组成的队列，一个task类似{future,waker，state}

```rs
// 真实的Future特征
trait Future {
    type Output;
    fn poll(
        // 首先值得注意的地方是，`self`的类型从`&mut self`变成了`Pin< &mut Self>`:
        self: Pin< &mut Self>,
        // 其次将`wake: fn()` 修改为 `cx: &mut Context< '_>`:
        cx: &mut Context< '_>,
    ) -> Poll< Self::Output>;
}
```

#### 2026年3月16日

executor和task spawner实现为消息队列的两端【receiver-sender】

spawner.spawn()把输入的future对象与自己的sender作为waker/context打包为task send到executor，注意在spawner调用future的new方法时，可能触发一些工作，单不是future通过.poll()的工作【例如在new中建立新线程】

executor从receiver取出task【Task离开消息队列】，用task中的Option包装的future里面包装为waker的sender作参数调用future.poll(),并根据pending与否更新指向future的Option指针[这决定释放future与否]

只有当所有sender都被销毁，receiver才会停止循环；executor.run将task的所有权拿到，用它的子字段future.poll;如果在poll中没有wake()则当前run循环结束后task和它的子字段都被释放，如果有wake，则task增加一个引用计数放入消息队列，task不会释放，receiver也保持等待s

IO 多路复用（IO Multiplexing） 是一种让单个线程能够同时监听多个网络连接（文件描述符）的状态变化（是否可读、可写）的机制：线程进入休眠等待，当某个连接有数据传过来时，内核会将该连接标记为“就绪”，并唤醒线程

IO多路复用是真正调用wake的途径，而非通过sleep结束的thread【不能开上万个thread】，IO 才是异步编程存在的真正原因；负责监听IO并实现多路复用的reactor【阻塞监听信号并在信号来临后调用wake】可以和执行器共享一个线程交替做工，也可以分为两个线程

Pin与Unpin:不允许内存对象改变位置【改变指针指向的地址中的值】
Pin是一个结构体包裹一个指针，确保该指针指向的对象不被移动，只能包裹没有实现Unpin特征的值的指针，否则没用 !Unpin；Unpin是标记特征，表明一个类型可以随意被移动【大量类型自动实现】

在结构体定义中加入  _marker: PhantomPinned,由于结构体内存在没有实现Unpin的字段，rustc不会为复合类型添加Unpin特征

处理栈上的pin数据时，注意栈上数据可能通过变量直接持有【pin通过包裹一个可变引用防止其他引用存在】，这可能会导致数据存活的时间比Pin指针长，此时只在pin的lifetime内保证不可变；相比之下，堆上数据不可能直接被变量持有，一般pin指针释放后数据一起释放

用async函数返回的future默认是!unpin不可移动的，如果一些函数会要求它们处理的 Future 是 Unpin 的必须要使用以下的方法先将 Future 进行固定:

- Box::pin， 创建一个 Pin< Box< T>>
- pin_utils::pin_mut!， 创建一个 Pin< &mut T>

固定后获得的 Pin< Box< T>> 和 Pin< &mut T> 既可以用于 Future ，又会自动实现 Unpin

async/await与stream流处理：处理未来值
async 是懒惰的，直到被执行器 poll 或者 .await 后才会开始运行，这在涉及生命周期时可能出现过期的引用；
async fn 函数如果拥有引用类型的参数，那它返回的 Future 的生命周期就会被这些参数的生命周期所限制；如果future涉及一个局部变量的引用，但future作为返回值则会dangling ptr，可以通过把局部变量移动到async块中来实现

```rs
use std::future::Future;
fn bad() -> impl Future< Output = u8> {
    let x = 5;
    borrow_x(&x) // ERROR: `x` does not live long enough
}
async fn borrow_x(x: &u8) -> u8 { *x }

// 上述定义会导致悬垂引用报错，下列定义将原涉及局部变量的函数整体转化为async块，变量拥有'static生命周期，可以正常使用

async fn borrow_x(x: &u8) -> u8 { *x }
fn good() -> impl Future< Output = u8> {
    async {
        let x = 5;
        borrow_x(&x).await
    }
}

```

可以用async move捕获环境中的变量，不受借用生命周期的限制，但只允许本async语句块访问这个变量；

多线程执行器会把future在线程间移动，因此 async 语句块中的变量必须要能在线程间传递；
由于需要在多线程环境使用，意味着 Rc、 RefCell 、没有实现 Send 的所有权类型【可能在原线程中保留clone，导致多线程并发修改】、没有实现 Sync 的引用类型，它们都是不安全的，因此无法被跨await使用【只有跨await才可能出现跨线程使用，如果在await间init+drop则可以使用】；同样地，在 .await 时使用普通的锁也不安全，例如 Mutex，可能持有锁后带到另一个线程导致原线程死锁，可以使用futures中的锁代替

stream流处理：Stream 特征类似于 Future 特征，但是前者在完成前可以生成多个值【相比future只有Poll::Ready(T)时返回值】，它的next方法跟标准库中的 Iterator 特征颇为相似;关于 Stream 的一个常见例子是消息通道（ futures 包中的）的消费者 Receiver:

```rs
async fn send_recv() {
    const BUFFER_SIZE: usize = 10;
    let (mut tx, mut rx) = mpsc::channel::< i32>(BUFFER_SIZE);

    tx.send(1).await.unwrap();
    tx.send(2).await.unwrap();
    drop(tx);

    // `StreamExt::next` 类似于 `Iterator::next`, 但是前者返回的不是值，而是一个 `Future< Output = Option< T>>`，
    // 因此还需要使用`.await`来获取具体的值
    assert_eq!(Some(1), rx.next().await);
    assert_eq!(Some(2), rx.next().await);
    assert_eq!(None, rx.next().await);
}
```

不能同时存在两个Next对象【future对象】【.next()返回的对象】，因为.next() 方法会持有 Stream 的 独占可变引用 (&mut S)，通常取出Next对象后直接await
Stream的优点是每次执行都有返回值、可以使用Iterator的若干方法【惰性的，等待await才逐个执行】、允许使用for_each_concurrent \ buffered 通过维护本task内部一个future池实现在调度器选择本stream的task时并发
.await和迭代器.await一个stream，实际上还是逐个task运行；需要for_each_concurrent 或 buffer_unordered等方法才实现Task内的并发【这些方法需要buffered的上游产出future对象，然后存储且并发这些对象】

同时运行多个future：通过宏
join!(future1,future2)并发两个task，不会由于一个pending就整体停止【future1.await,future2.await的效果】，而是每个都尝试poll一次，全部ready才返回ready否则返回pending
try_join!()在一个 Future 返回Err后就立即停止所有 Future 的执行，try_join!也返回Err，否则返回Result< (future1's return,future2's return)>
select!()同时等待多个 Future ，且任何一个 Future 结束后，都可以立即被处理【相比join只在全部ready才给出两个async的返回值】

#### 2026年3月17日

select!对若干future各poll一次，如果其中一个返回 Ready：执行对应的分支代码，select!返回这个分支的最后一行表达式；如果都是pending，则select!作为async块返回pending等待下一次调用

```rs
select! {
    a = a_fut => total += a,
    b = b_fut => total += b,
    complete => break,
    default => panic!(), // 该分支永远不会运行，因为 `Future` 会先运行，然后是 `complete`
};
// 语法是模式匹配future返回值，future返回值由poll()给出
// 其中一个future结束，也drop另一个future

// complete 分支当所有的 Future 和 Stream 完成后才会被执行，它往往配合 loop 使用，loop 用于循环完成所有的 Future
// default 分支，若没有任何 Future 或 Stream 处于 Ready 状态， 则该分支会被立即执行
```

.fuse() 方法可以让 Future 实现 FusedFuture 特征， 而 pin_mut! 宏会为 Future 实现 !Unpin 特征，这两个特征恰恰是使用 select 所必须的
FusedFuture 中，Future 一旦完成后，那 select 就不能再对其进行轮询使用，再次调用 poll 会直接返回 Poll::Pending;只有实现了 FusedFuture，select 才能配合 loop 一起使用
unpin特征是因为select!宏中调用方法签名要求

.terminated()构建一个空的ready的future，可以用..set()填入新的future，用于select!循环
.await调用future对象的poll，如果返回值是pending则切换task，否则返回Ready< T>的T

递归使用async fn时可能构成DST，修正方法是对async块调用.boxed()
无法在特征中定义async函数，可以用!async_trait解决;但每一次特征中的 async 函数被调用时，都会产生一次堆内存分配。

## rCore 导学：Rustlings 80题

结构体更新语法：

```rs
        let your_order = Order {
            name: String::from("Hacker in Rust"),
            count: 1,
            ..order_template  // 使用更新语法继承其他字段
        };
```

clippy要求代码更优雅，更严格检查，可以rustup component add clippy下载

Option< T> 实现了 IntoIterator,等价于：

```rs
match option {
    Some(x) => 一次循环
    None => 零次循环
}
```

AsRef< T>特征的fn as_ref(&self)->&T将self转化为&T,这样可以扩大函数入口对参数的限制，参数要求实现AsRef,函数体内对参数as_ref()；as_mut类似，转换为可变引用

Option:Some/None; Result
std::error:Error是所有标准错误类型都会实现的trait
map_err(< fn>)对result使用，不改变ok的类型，改变Err(e)的e类型为自定类型，fn输入原始e类型，输出< fn>返回类型e'的Err(e')
let定义变量，const定义常量

HashMap的entry()输入Key类型，输出Entry< K,V>枚举类型，变体如下：

```rs
enum Entry< 'a, K, V> {
    Occupied(OccupiedEntry< 'a, K, V>),
    Vacant(VacantEntry< 'a, K, V>),
}
```

and_modify输入一个“输入类型为值的可变引用类型的闭包fn”or_insert()输入value类型，输出Entry< K,V>枚举类型；对于Entry< K,V> 根据Occupied/Vacant与否选择返回不同处理后的Entry，一般允许链式处理

关于cnb和rustlings
rustlings使用rustlings verify对所有exercise进行一次检查，rustlings run < exercise_name>检查单个作业，rustlings watch进入持续检查状态，每次修改重新检查全部exercises

vec实现iter()返回元素为&i32的迭代器，iter_mut()返回可变借用迭代&mut i32，into_iter()返回有所有权的迭代，元素为i32；&str.chars()返回Iterator< Item=char>,对这个迭代器对象调用.next()返回复制的char，.as_str()返回剩余部分的不可变借用切片;对slice调用.iter()返回&T

Iterator:是一个trait，有关联类型Item，标准库实现如下：

```rs
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option< Self::Item>;
    // 还有很多默认方法，例如 map, filter, collect 等
}
```

iter/iter_mut/into_iter的关联类型不同，输出类型不同，生命周期不同；Iterator实现了map、filter、collect等方法

Vec< String>.join(' ')用空格连接各项输出String：

```rs
let division_results:Result< Vec< i32>,DivisionError>= numbers.into_iter().map(|n| divide(n, 27)).collect(); // 由于实现了从Iterator< Result< T,E>>到Result< Vec< t>,E>的转换FromIterator，所以可以从Result< i32,Err>的迭代器转换到Result< Vec< i32>,Err>: Ok([1, 11, 1426, 3])
let division_results:Vec< Result< i32,DivisionError>>= numbers.into_iter().map(|n| divide(n, 27)).collect(); // 这里直接把各个Result拿出来放入一个Vec即可:[Ok(1), Ok(11), Ok(1426), Ok(3)]
```

开区间/闭区间类型实现了Iterator；迭代器的product()函数把所有元素相乘
HashMap.values()获取迭代器;对迭代器作filter(fn< &Item迭代器的元素的引用>->bool)返回满足要求的元素构成的迭代器；count()记录迭代器的元素个数；

手动实现String方法时注意不能对&str直接用索引[i]访问，而是[i..i+1]区间；要按字符访问ch:char=input[i..].chars().next().unwrap();i+=ch.len_utf8();

to_owned()克隆对象返回一个拥有**所有权**的新值，常用于把 借用数据（如 &str、&[T]）转换为 拥有所有权的数据（如 String、Vec< T>），内部根据类型实现Clone；

&str的各种方法输出类型各不相同，具体情况具体分析；.trim()\get()\find()\split()返回&str,大部分方法返回String如to_uppercase/repeat/push_str/replace等需要修改原字符串的

### 2026年3月4日

理论上fn中引用参数都需要lifetime，但是存在3个默认推导：

- 每个参数有自己的 lifetime。
- 如果只有一个输入参数，返回值引用就默认和这个参数同 lifetime。
- 如果有多个输入参数，但有一个 &self 或 &mut self，返回值引用默认和 self 同 lifetime

引用的生命周期不能超过它所引用的值的作用域，否则就会悬空引用；值的作用域决定什么时候被释放，什么时候回收变量名；生命周期从引用创建【注意不是声明】开始，到引用指向的值生命周期结束或者最后一次使用，取最短那个

一般值的lifetime与scope相同，引用类型的scope到下一个'}',lifetime见上文; 包含引用的结构体也需要声明lifetime: struct Book< 'a>{}
'a 指明了返回值引用和输入引用的关系，编译器会按这个规则检查安全性；如果提供的标注错误，则当无法访问【悬垂引用，超出引用对象作用域】时报错

用macro_rules!宏来定义一个宏：

```rs
macro_rules! my_macro {
    () => {
        println!("Check out my macro!");
    };
}
```

{}内定义宏规则，()表示不需要输入参数;允许在宏规则中定义若干输入处理，用;分隔即可()=>{};(&val:expr)=>{}

宏不能通过< module-name>::< macro-name>查找[不是模块成员]，而是在逐个{}查找，必须在当前查找的词法作用域{}内直接定义【不能定义在{}内一个mod下】才可以查到；#[macro_export]将宏防入crate-root，或者在mod中pub(crate) use < macro-name>让他成为模块路径成员；

宏展开发生在类型检查之前，它的()参数匹配:($var:expr)、($x:ident)表示匹配对象$x是ident标识符、$var是表达式,：后不是类型，可选的语法匹配如下：

- expr 表达式
- ident 标识符
- ty 类型
- pat 模式
- stmt 语句
- block 代码块
- item 函数/struct等条目
- literal 字面量
- path 路径

if let < pattern>=< value>{},注意pattern在前；while-let pattern=expression匹配时一直循环

Rust的多线程：thread::spawn()创建线程并返回一个JoinHandle，对handle.join()等待结束；spawn(move ||{})表示把线程涉及的对象所有权移动到线程【Rust闭包默认尽量借用外部变量,这里move是闭包的一部分】
对handle.join()得到Result,unwrap得到线程返回值【线程的最后一行】

Arc\[Atomic Reference Counted][arc的修改记数是原子的，从而用于多线程的共同持有变量],指向数据，也记录原子引用记数；只要计数>0就不释放heap数据，这避免了使用&[]时主线程内变量释放可能比子线程结束早导致的悬垂引用
Arc只提供不可变的引用，可以使用Arc::new(Mutex::new())创建互斥锁Mutex< T>保护的数据类型T;Mutex对象调用lock()获取锁,被占用则阻塞等待【切换线程】，返回Result< MutexGuard< T>, PoisonError>，可以deref为< T>并可以修改；Guard的作用域结束自动释放，也可以drop(< guard>)
Arc< T>提供自动deref为T

递归定义的数据结构【如链表】不能定义在stack上【因为不知道会展开多大】，需要用Box智能指针包裹子对象

Cow对象，提供不可变借用和lazy-copy，是一个enum< T>：

```rs
enum Cow< 'a, B>
where
    B: ToOwned + ?Sized,
{
    Borrowed(&'a B),
    Owned(< B as ToOwned>::Owned),
}
```

Owned是ToOwned的关联类型；如果Cow::from()时传入的是引用，自动返回Borrowed；如果传入值则返回Owned，这是由于不同类型实现的From-trait不同；这个Cow建立在Borrow-trait上，这个trait允许A类型借用为B类型

Rc< T> = 单线程下的“共享所有权”智能指针,解决一个对象具有多个owner的情况，内部维护引用记数，=0时释放；rc.clone()是增长引用计数返回引用；用drop()销毁对象，减少引用计数；

当运行 cargo test 时，编译器会自动找到所有带有 #[test] 属性的函数并执行它们;#[cfg(test)]  表示只有在测试模式cargo test下才编译这个模块;为测试fn加上#[should_panic]在测试时以panic为正常结果

unsafe关键字声明的item{多行语句、trait、fn等}表示不检查这部分安全性；最好在Item的文档注释中的# Safety条目下描述具体进行的操作和unsafe fn需要满足的要求

对引用/裸指针需要通过*访问具体值；Box::into_raw()消耗一个Box< T>返回一个*mut T裸指针,from_raw()相反;Option.take()从Option中取出值，原位置留下Nonw，返回一个Option

Cargo可以通过使用build.rs在构建项目时执行额外的命令，例如生成rust-module、配置特定包、加载ENV环境变量等；在build.rs中使用println!("cargo:{}",your_command)来执行某些命令,your_command通常类似"rustc-cfg=feature=\"pass\""或"rustc-env=TEST_FOO=123"；cargo build命令后，编译运行biuld.rs,这些println输出到stdout被cargo捕获解析，再以这些解析后的编译行为编译main.rs

Rust支持导入的其他语言外部函数，通过extern关键字支持；外部导入的函数在 extern 块中声明，并使用分号来标记函数签名的结束；可以修改链接行为如使用 #[link_name = ".."] 来修改实际的符号名[意思是实际链接名时link_name,修饰的是别名,这个修饰只能在extern块内使用，不能对外部函数定义使用]；在自己的函数定义前添加extern关键字导出到链接环境;如果导出自己的rust函数到链接环境和导入rust，不需要extern < ABI>声明[< ABI>如"C"\"Rust"等]

// Rust 默认会对符号名进行名称修饰（mangle）【在文件中指定的名称前加入随机字符】，就像 C++ 一样。为了抑制这种行为，使函数可以通过名字被链接到，可以使用属性 #[no_mangle]修饰函数定义。

extern块让链接器找到函数声明对应的指定符号；可以在某种程度上实现调用mod内部的fn：extern把声明的函数引入当前module，可以在mod内部extern一个fn，在另一个module下extern声明；extern加在fn定义前是导出，extern{}是导入

提供mpsc【multi-processor-single-consumer】用于多线程通信；mpsc::channel()获取sender/receiver,sender.send(value)返回Result< (),SendErr>,receiver实现Iterator，直到接收到全部sender信息才结束

特征对象为什么不能由impl的泛型代替？因为无法处理Vec< dyn < trait>>
item: impl SomeTrait+OtherTrait要求满足多个特征的泛型

NotNull< T>是非空裸指针封装,通过.as_ptr()获取指针，实现了Copy从而可以不改变所有权;对于Option< T>，只要T实现Copy，Option也实现

不能在泛型声明里直接用 impl Trait。impl Trait 只能在函数参数或返回值里用，不能用于 struct 泛型约束;对方法的约束在一个impl块中相同，体现在impl< T> struct< T> where < T:traits> {..}

pattern matching可以自动deref【对借用和指针】，方法调用【方法的self参数指出目标类型】、字段访问【可以推断目标类型】、参数类型匹配【形参要求类型】都会自动deref以尝试匹配类型要求；但是一般表达式不会自动deref；

一般来说，遍历“借用的迭代器”得到的通常是 &T（或 &mut T），但具体取决于 你对容器调用的迭代方式

用Vec!宏可以避免Vec::new([elem;len])要求len必须是编译期常量；into_iter\iter_iterMut是三种类型，分别实现了Iterator特征的next方法，通常通过一个strcut的不同方法【into_iter()\iter()\iter__nut()】获得；其中into_iter会夺走原结构的所有权放入自己的结构中，iter会构建一个由借用构成的结构供next返回，iter_mut构建可变借用构成的结构

ref关键字和&不同！前者let ref x=..是指出x为借用类型，后者&mut x是模式匹配，匹配后调用copy特征进行复制

## rCore 基础：os基础模块与非标准库编程

### part1: concurrency_sync

#### 2026年3月8日

对spawn()返回值【builder.spawn()返回Result< JoinHandle< T>,Err>，thread::spawn()返回JoinHandle】unwrap()得到handler作.join()得到Result< T,Err>，当线程正常返回得到Ok(),panic时得到Err();
thread::Builder::new()构建线程生成器，对Builder.name()指定线程名称，Builder.stack_size()以byte为单位指定线程栈大小；Builder.spawn()按照要求生成线程
Cell/RefCell允许作为不可变对象改变对应值，是为了在共享引用&T下允许修改[某种数据结构需要多人持有，但是也需要修改];
thread_local!{static var=value;}宏可以定义每个线程的变量,但实际上定义的变量类型是LocalKey< T>,需要通过对var.with(|value|{..})调用with传递闭包来使用具体变量，这里的value类型是&T，不允许move线程变量
作用域thread：通过保证线程比当前作用域早结束，让线程可以借用当前栈上的数据，而不需要把数据 move 进线程[包裹一个闭包，闭包内部创建并结束线程]:

```rs
let (sum_a, sum_b) = thread::scope(|s| {
    let h1 = s.spawn(|| a.iter().sum::< i32>());
    let h2 = s.spawn(|| b.iter().sum::< i32>());
    (h1.join().unwrap(), h2.join().unwrap())
});
```

创建一个线程作用域，保证在 scope 结束之前，所有通过 s.spawn() 创建的线程都会被 join；s是这个scope的handle

MutexGuard< T>实现Deref所以可以用*取出值;

函数体中，临时变量寿命在单行内【行内drop()】，不能作为返回值【会出现生命周期不够长的错误；这时赋值给一个变量，可以把寿命延长到block结束】；函数在给出返回值【放入栈帧】后drop局部变量

创建进程：process::Command 创建子进程并执行命令；Stdio::piped()创建pipes并dups()；通过stdin/stdout通信;.output()获取进程返回值
Command::new()相当于fork并替换程序；当fd的对应Stdio对象drop时fd自动关闭；

Command::new(< Asref< OsStr>>)返回command类型,对command类型调用.args(< Iterator< Asref< OsStr>>>)/arg(< OsStr>)传入参数返回&mut command，.stdout(T:Into< Stdio>)配置子进程的stdout到指定句柄并在调用output时链接到output返回和的stdout上，.output()运行命令返回io::Result< Output>包括所有输出/.status()启动进程并返回io::Result< exitStatus>只关心程是否运行成功/.spawn()启动并返回Result< Child>不阻塞当前进程,.expect(&str)取出Ok中的value,Err则panic传入的str,String::from_utf8_lossy()将&[u8]转换为Cow< str>

drop(stdin)关闭stdin【对应的pipe】;Spawn返回的Child结构体stdout\stdin\stderr三个Option，包裹childStdin/../fd，对childstdin提供write/childstdout提供read方法

```rs
pub struct Child {
    pub(crate) handle: Process,
    pub stdin: Option< ChildStdin>,
    pub stdout: Option< ChildStdout>,
    pub stderr: Option< ChildStderr>,
}
```

对child调用.wait()获取Result< ExitStatus>等待进程结束

rust自动关闭绑定到子进程输出端管道的输入，和绑定到子进程输入端管道的写入；如果不关闭管道的输入端，则读取端会一直阻塞

.ok()把Result转化为Option；and_then当输入是SOme/Ok时取出值用闭包处理，否则直接传递给下一步；or_else当输入是None/Err时处理，否则直接传递给下一步；unwrap_or()取出Some的值或返回一个值【None时】;from_utf8_lossy总不失败，需要失败时用from_utf8.map_err()

Command接受AsRef< OsStr>特征的参数，AsRef< T>表示本类型可以借用为&T，OsStr是操作系统原生的字符串

### part2: no_std_dev

#### 2026年3月10日

BufReader对实现read特征的类型可以交给Bufreader创建缓冲阅读；提供了.lines方法返回String迭代器每次返回一行直到none;常见Reader包括File::open()\TcpStream::connect()\std::io::Stdin/子进程管道child.stdin.unwrap(),内存中不需要因为是为了减少为外部开销【磁盘寻道、网络延迟、系统调用】

指针算术：对于裸指针，rust需要通过.add(i)的方式；
函数头unsafe，内部不用unsafe

\#[unsafe(no_mangle)]不进行符号修饰，强制要求编译器保留函数原名。你写 my_function，生成的二进制符号就是 my_function

*mut与*const的转换不受rustc的监管

碰撞指针式heap-allocator：维护next指针分界used和free，超出可用空间返回空指针，否则atomic更新next指针；free-space用完则reset指针
core::alloc::{GlobalAlloc, Layout[描述分配内存的size和对齐]}：Rust 内核分配器的基础 Trait 和布局描述；使用AtomicUsize和compare_exchange

CAS:在已经读取的基础上，compare-and-swap如果compare发现和已经读取的内容一样则swap为希望修改成的新值；如果compare发现已经修改，则重新读取并尝试CAS

为一个满足GlobalAlloc的static变量加上#[global_allocator]标签，表示使用这个变量作为heap-allocator；这个GlobalAlloc特征通过alloc和dealloc方法分配空间,这里必须是跨线程安全的【使用原子类型AtomicUsize】【决不能panic、layout计算必须正确、不能在alloc内部再申请堆空间否则死循环】

原子类型可以代替Mutex互斥锁实现线程安全的共享修改，AtomicUsize通过load\store\fetch_add、sub、update\compare_exchange读取并更改；

关于Ordering：
单线程环境下，指令重排不改变运行结果；多线程下线程A的访存重排影响线程B的访存【例如A写入后发信号B读取，可能A重排先发信号后写入，对A的运行没有影响，但是B读取到信号后尝试读取，可能读不到A写入的内容【可能还没写】】，Ordering决定这个原子操作与逻辑上周围内存访问指令的相对顺序；

RElaxed不指定顺序，Release要求当前线程逻辑上之前的内存访问【写入】在本次原子访问前全部完成，Accquire要求当前线程之后的读写内存操作不能移动到当前原子操作之前，AcqRel同时具备acc和rel的特性，SeqCst具有AcqRel的特性且保证在各线程中的SeqCst操作之间 存在一个各线程都看见的唯一顺序【所有核心的 SeqCst 操作都会排成一个唯一的、线性的一队】

具体进行一个SeqCst操作时，会强制清空缓存写入内存，并同步到其他线程的缓存】【即是说如果有SeqCst的action1,action2,action3，任意一个线程看到的内存发生改变的顺序都是action1,action2,action3，避免了thread A检查thread B是否busy后设置busy，同时thread B check thread A是否busy后设置busy时，二者都看到对方不busy并同时设置busy的情况【这可能因为缓存延迟，A只看到自己的busy，看不到B的busy，此时在A的视角set A busy先发生于set B busy；B视角只看到B busy看不到A busy，认为set B busy先于set A busy发生;查询Dekker算法冲突 for detailed infos】

rel只要求之前的内存操作已经写入内存，不要求自己这个原子操作立刻写入内存【从而可能在缓存中】；但是SeqCst强制自己这个原子操作也需要立刻写入内存并刷新到所有线程的缓存中；多个线程互相读取状态时，需要保证SeqCst

compare_and_exchange需要两个Ordering，因为成功时你执行的是“读-改-写”，而失败时你执行的仅仅是“读”。 这两者的同步需求完全不同

FreeList allocator用链表跟踪所有free-space，释放时把块插入list头部，获取时first-fit，在free-block开头放一个结构体，描述本块大小给出下一个块的指针

*mut < T>表示一个原始指针指向一个T，影响指针算术的step，和允许解引用后访问字段与否；*mut.write(< T>)向指定可变裸指针写入内容；侵入式链表将节点信息存储在管理的空闲space内部；

core库可以直接形成汇编语言不依赖glib和操作系统；让写一个syscallABI，就是在代替glib直接调用汇编语言/机器语言；core::arch::asm!宏执行汇编指令，第一个参数是字符串字面量描述的指令，后面每一行给出rust变量与cpu寄存器的关系，in(< reg>)< value>将value输入到reg寄存器，out相反；
inlateout(< reg>) < var> =>< var2>将var1输入reg，延迟输出到reg，最后存入rust变量var2；late (延迟输出)告诉编译器，rax 寄存器在汇编指令执行完以后才会被用来存储返回值。这允许编译器更激进地优化寄存器分配

对slice用.as_ptr()获取裸const指针；不需要的arg填0；对于空数组字面量，视为'static周期，提升到rodata段，并且满足对任何内部元素的要求【指的是，如果struct有一个属性类型要求'static &[&str],则&[]能通过rustc对内部元素的检查】

iter的position(f)方法，接受闭包，对所有元素应用，返回第一个返回值为true的元素的index，包装为Some(index)；如果不存在返回true的元素，则返回None;.get()方法传入idx输出Option当idx越界返回None；flatten()展开iterator构成的iterator，Option也是iterator，展开后为Some/None，因为None也是iter判断结束的标志，Option::None直接返回None认为不加入展开后的序列，从而实现过滤None的效果；

Option.asref()将&Option< T>转化为Option< &T>,防止消费性适配器消耗原对象；

### part3：os_concurrency

#### 2026年3月13日 continue

如果本原子操作与之前的内存操作无关则用relaxed不需要等待之前完成；依赖前面内存操作则load需要acquire；后续操作必须可见本修改则store-released
一般涉及load-and-store的复合操作，则有“Acquire makes the store part of this operation Relaxed, and using Release makes the load part Relaxed”，另外acquire用于load，release用于store

涉及多个变量的操作用SeqCst[因为acqrel无法保证多个信号量的操作之间不被重排],单个变量可以用AcqRel保证【这里的“单个变量”不是AcqRel的原子数据，而是普通数据，原子数据是flag】；单个线程中的SeqCst操作之间逻辑顺序一定等于实际顺序

相比release-load和acquire-store满足这两个原子操作之外的内存操作一定保证顺序，SeqCst更保证了这两个load、store的内存操作顺序于逻辑顺序一样【前者不能保证store操作不重排到load操作前】
注意有时候一个signal也许需要SeqCst，例如要求store后必须立刻全局可见；不能混用SeqCst和acquire,后者虽然收到失效信息但是不强制清空并重新读取，仍然可能用SeqCst更新前的数据

compare_and_exchange虽然有两个动作，但在硬件上是一个原子动作；由于兼有store-load性质，可以要求前后的内存操作是否超过本操作;总是保证不会错误，但有可能需要等待缓存写入

core::hint::loop暗示cpu在空转循环，不要把流水线塞太满；RAII[Resource Acquisition Is Initialization],构造对象时自动获取锁，对象离开作用域时自动释放资源；Send特征是一个标记，说明可以实现线程间所有权的迁移；Sync决定值的引用可否跨线程访问；

对spinlock，通过让.lock()返回一个SpinGuard，在Guard上实现deref为spinlock和Drop，来实现RAII自动unlock；为什么不应该直接释放lock？因为unlock实际上只是在把locked=false并非释放锁，锁是需要长期存在保护对象的；利用Guard对象自动调用drop的机制顺便unlock锁

### part4: context_switch

caller-saved-reg和callee-saved-reg，前者通常是caller计算的中间结果，后者是长期存在的值【如果callee用不到可以不保存，减少入栈】；区分callee和caller是为了减少寄存器出入栈，如果caller保存的部分够用了就不用callee保存了；这基于caller不知道callee需要用哪些reg，只能保存所有正在使用的reg，如果把所有寄存器视为caller-saved则导致每次保存大量寄存器
当前方案把寄存器分为两部分，caller-saved部分强制call前保存，callee-saved部分根据callee的需要保存，这样减少了reg出入栈

\#[unsafe(naked)] 取消rustc对函数的prologue和epilogue,配合naked_asm!使用；naked_asm!只能直接写汇编代码，asm!可以通过in()\out()实际上导致插入ld/mv汇编指令，且由于后者在普通函数中运行，会存在prologue和epilogue
作context-switch时，不希望出现prologue& epilogue：因为prologue把调用switch-context函数后的返回地址压入栈并移动sp，epilogue取出帧指针sp和ra并跳转ra，前者移动sp特定长度作为栈帧，后者的epilogue从sp上特定位置【depends on prologue申请的栈空间大小】取出ra并恢复栈帧时sp已经指向新的context，这样ret时使用的所谓"ra"是新context中未知的东西而非新context中刚刚写入的ra，导致UB！
epilogue不只是ret【使用ra跳转】，还包括从sp上特定位置读取ra并调整sp帧指针

让sp为let aligned_sp=(stack_top-16)&!0xf;减小16留出空档以防越界写入；

rCore-basic的线程调度器流程：线程表示为{context、thread_state、stack、entry线程函数}
调度器初始化时创建一个主线程entry=None,state=Running; 维护一个vec保存的线程池和current_thread，schduler.run()设置全局调度器变量为当前调度器，进入循环，不断检查当前**主线程之外**是否全部为Finished，如果是则退出，不是则schedule_next()只好到下一个ready_thread；schedule_next()寻找下一个ready，找到则更新current状态为ready[current!=Finished时更新]，next状态更新为running，更新全局变量CURRENT_ENTRY为next的entry，这是为了不改变next通过thread_wrapper开始运行[检查全局变量CURRENT_ENTRY是否为空，如果不则运行这个entry，运行完毕后标记当前thread=finished,调用schedule_next()重新寻找ready]
thread_wrapper用于在线程开头进入entry，可见CURRENT_ENTRY只在开始thread时有用，之后再入不需要；thread的切换完全由wrapper的Finish和thread内部自己yield驱动,所以不会被突然打断；

iter的all()函数，传入一个闭包，如果全部元素的返回值都是true则all返回true，否则返回false；注意迭代器加上的迭代器适配器不会立刻改变原值，只是附加运算;Option.take()返回一个Option，把调用take()的Option修改为None，移动所有权

### part5: async_programming

#### 2026年3月14日 continue2

为struct实现Future，将结构体作为一个手动推进的状态机，通过结构体的字段记录当前状态，通过poll立刻进行状态转移并返回；
对一个实现了Future的结构体调用.await方法，暂停当前函数的执行直到这个Future返回ready；waker.wake()时再次调用Poll方法【具体见Async的详细描述】

特征Future提供一个poll方法，尝试推动任务进度，返回Poll枚举类型[ready和Pending]，waker唤醒pending的函数继续运行

Pin< &mut T>通过加一个&mut T防止用安全的方式将内存中某个对象移走move；Future的Output关联类型描述Poll::Ready时返回什么类型，

```rs
pub enum Poll< T> {
    Ready(T),
    Pending,
}
```

### part6: pagetable

#### 2026年3月17日 continue

tokio是多线程的executor，tokio::spawn()新建一个task并开始执行【不会嵌套在本async内】，返回handle指向那个task；对handle.await返回result
child_future.await对于当前task的效果是suspend current funtion until child_future complete，调用子future的poll如果ready则继续，如果pending则切换到别的task；等这个child_future调用wake让父future重新进入运行队列，从离开的状态机继续运行

tokio::sleep()返回一个future对象

result.ok()将result对象转化为option;as_Ref把&Option转化为Option< &T>

- va:vpn|offset,vpn比较短
- vpn->ppn
- ppn+offset

允许自行登记pa与va的对应，map_page只新申请页表页，为传入的pa登记到pte；rCore这里的实现是用hashmap维护映射关系，实际上不访问内存查找
应当把pte中的ppn理解成一块存储的起始地址，这样能更好理解大页
tlb中asid字段区分不同进程

## rCore Tutorial

### Chap 0：Intro

#### 2026年3月20日 continue2

C语言、rust的标准库向上提供了与os交互的系统调用接口；执行环境为应用程序提供运行时服务，app通过于系统软件约定好的ABI请求服务
操作系统是一种系统软件，主要功能是向下管理CPU、内存和各种外设等硬件资源，并形成软件执行环境来向上管理和服务应用软件；主要包括内核、系统工具和软件库、用户接口
内核功能：进程线程管理、内存管理、文件系统、网络通信、设备举动、同步互斥、系统调用

=>打孔卡片类似于人工输入机器代码=>开发编译器把符号代码自动转换为机器代码=>计算机速度提高导致人工操作拖慢工作效率=>引入Monitor辅助程序的输入输出加载运行=>出现汇编编写的早期os，并为了在加载程序时不让处理器空转【单用户占用】，引入批处理【连续读入->处理->readin->process 多个作业】和多道程序处理【虽然batch连续处理，但是io仍然耗时,多道程序允许在内存中存储多个任务，一个任务io时另一个任务运行】=>程序隔离需求、难以debug的缺点带来多用户分时系统和进程=>pc的发展带来GUI、驱动的发展=>现代在不同应用场景使用不同os【服务器os：只运行一个应用服务程序，并发量极高；面向pc的os：多任务多驱动，不需要多用户；手机/平板的os、嵌入式os】

iOS 和 Android 操作系统是 21 世纪个人终端操作系统的代表，Linux 在巨型机到数据中心服务器操作系统中占据了统治地位[Android实际上基于linux内核]

> API 与 ABI 的区别
> 应用程序二进制接口 ABI 是不同二进制代码片段的连接纽带。ABI 定义了二进制机器代码级别的规则，主要包括基本数据类型、通用寄存器的使用、参数的传递规则、以及堆栈的使用等等。ABI 与处理器和内存地址等硬件架构相关，是用来约束链接器 (Linker) 和汇编器 (Assembler) 的。在同一处理器下，基于不同高级语言编写的应用程序、库和操作系统，如果遵循同样的 ABI 定义，那么它们就能正确链接和执行。
> 应用程序编程接口 API 是不同源代码片段的连接纽带。API 定义了一个源码级（如 C 语言）函数的参数，参数的类型，函数的返回值等。因此 API 是用来约束编译器 (Compiler) 的：一个 API 是给编译器的一些指令，它规定了源代码可以做以及不可以做哪些事。API 与编程语言相关，如 libc 是基于 C 语言编写的标准库，那么基于 C 的应用程序就可以通过编译器建立与 libc 的联系，并能在运行中正确访问 libc 中的函数。

API关心函数名、参数类型、逻辑调用；ABI关心寄存器分配、调用栈布局、字节对齐；操作系统主要通过基于 ABI [传参基于寄存器]的系统调用接口来给应用程序提供上述服务

执行环境: 基于裸机的应用程序=>基于函数库Lib的应用程序，通过Lib间接调用硬件=>基于os的应用程序，app通过函数库-os系统调用-hardware使用硬件=>基于java的应用程序在函数库和os-kernel间加入一层虚拟机

关于控制流：os层次上，有中断[IO导致]、陷入[ecall]、异常[除0]三种异常控制流，带来上下文的切换

> 在 RISC-V 的特权级规范文档中，异常指的是由于 CPU 当前指令执行而产生的异常控制流，中断指的是与 CPU 当前指令执行无关的异常控制流，中断和异常统称为陷入。当中断或异常触发时，我们首先进行统一的陷入处理流程，随即根据 mcause/scause 等寄存器的内容判定目前触发的是中断还是异常，再对应进行处理。在操作系统意义上的陷入，在 RISC-V 的语境下属于异常的一部分。

进程空间：通过在页表中标记特定页在磁盘上，实现为进程提供比内存更大的存储空间

操作系统的特征：虚拟化 (Virtualization)、并发性 (Concurrency)、异步性、共享性和持久性 (Persistency)
elf内部访问全局变量时，直接假定code和变量从某个虚拟地址开始，按照elf文件内相对文件开始的偏移量加到这个起始地址上，写死地址；这要求os真的把elf加载到这个虚拟地址开始的地方，从而让写死的地址真的能访问到全局变量

### Chap 1：基本执行环境

#### 2026年3月23日

![运行时环境](image.png)
SBI也为操作系统提供一些服务

编译器在编译、链接得到可执行文件时需要知道，程序要在哪个 平台 (Platform) 上运行， 目标三元组 (Target Triplet) 描述了目标平台的 CPU 指令集、操作系统类型和标准运行时库

> rustc --version --verbose 返回目标三元组
> riscv64gc-unknown-none-elf 的 CPU 架构是 riscv64gc，厂商是 unknown，操作系统是 none， elf 表示没有标准的运行时库。没有任何系统调用的封装支持，但可以生成 ELF 格式的执行程序。

用cargo run --target riscv64gc-unknown-none-elf 要求形成在指定平台上运行的程序，在config文件中[build] target=...默认时用指定平台； main.rs 的开头加上一行 #![no_std]， 告诉 Rust 编译器不使用 Rust 标准库 std 转而使用核心库 core [在标准的 Rust 程序中，编译器会自动链接标准库（std），并生成一段隐藏的启动代码（Runtime），这段代码会初始化环境并最终调用你写的 fn main()]

标准库 std 提供了 Rust 错误处理函数 #[panic_handler]，其大致功能是打印出错位置和原因并杀死当前应用。 但核心库 core 并没有提供这项功能，得靠我们自己实现；通过标记 #[panic_handler] 告知编译器采用我们的实现，使用core::panic::PanicInfo作为捕获panic的输入

```rs
// os/src/lang_items.rs
use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}
```

需要名为start的项，作初始化工作：在执行main函数之前，需要start语义项初始化栈、设置线程TLS，处理命令行参数，然后调用main;添加_start前程序能通过编译但是是空程序

```rs
// os/src/main.rs
#[no_mangle]
extern "C" fn _start() {
    loop{};
}
```

qemu启动的-device loader,file={编译好的可执行文件}，addr={指定的内存地址}； -bios $(BOOTLOADER)指定0x80000000处固件，SBI运行在m-mode；elf包含元数据，bin仅仅包含机器码，后者给cpu/bootloader读取，前者给os读取
链接时确定机器码中的固定地址，都是基于link.ld中给出的虚拟地址；所以正确执行需要qemu加载的基地址于link.ld中指定的vma相同；linker操作rustc形成的大量section，组织他们如何排列

\#[macro_use] 告诉编译器：“请把 console 模块中定义的所有宏，直接『拉』到当前作用域（Crate Root）中来；当你写 mod board; 时，编译器会默认去 src/ 目录下找 board.rs 或者 board/mod.rs，#[path = "..."] 强行切断了默认查找逻辑，告诉编译器：“别管模块名叫什么，请去这个特定的路径读取代码文件

整体过程：rustc形成大量section，linker按照脚本排列他们形成elf，qemu把这个elf=>bin加载到指定地址，然后RustSBI执行后跳转到os-bin；因为linker指定了首个text段是test.entry[定义于entry.asm],所以执行这个section，call main函数，通过符号声明得到链接脚本中标记的地址

在 RISC-V 的 QEMU 虚拟机（virt 机型）中，地址 0x100000 被映射到了一个虚构的测试设备上,你向这个内存地址写入特定的数值，QEMU 监听到这个写入动作后，就会根据数值执行“退出模拟器”或“重启”的操作。

调用sbi实现Write trait，再在上面封装print!;sbi功能通过从s-mode调用ecal传入参数调用

### Chap 2：批处理系统

#### 2026年3月23日 continue

由于没有实现文件系统，通过脚本对每个编译后的可执行文件-section写一段linker，全部硬加载在可执行文件中；main启动第一个app，之后每个app调用sys_exit结束，先通过stvec中断向量寄存器执行trap.S保存context，然后系统调用exit->run_next_app用新创建的context覆盖kernel上存储的context，返回用户态执行；由于单道程序，所以不用考虑在切换程序时保存栈，直接覆盖用户态栈即可
run_next_app将app程序固定加载到指定内存，所以形成的context.entry固定为这个地址即可
U/S间用sret返回，ecall进入;u->s跳转到stvec，s->m跳转到mtvec，sret时跳转到sepc【从S到U】，mret跳转到mepc【从M到S】；mret和mtvec基本只由sbi调用，内核不用；ecall从不同用户态引发的异常不同
main函数最后结束到panic!用#[panic_handler]接著，用qemu提供的handle写入值并关机；或者loop{}

在同一个 Package 中，所有的 Binary 目标都会默认链接（Link）到 Library 目标, 对单个项目的cargo build会导致lib也被编译，链接时可以使用；可以将lib.rs视为/bin的标准库
这里实现批处理的方式是，对多个app用user下的link形成bin，然后在os的link中加载link_app.S,这个汇编文件中加载各app的bin到.data中的一个section，整理出所有bin的_start【实际上重命名了各app的_start为app_[i]_start】和具体内容，都放到os-bin的.data中，用不同符号给出开始地址，

\#![linkage="weak"]只有在其他搜索没有找到时使用这个函数
在重新加载app到0x804000000后，需要asm!(fence.i),这是在刷新指令缓存,因为修改了指令部分；cpu往往认为指令不会变化，不会flush，这里需要自行清空缓存，强制要求读取新的指令；这里选择0x80400000是为了选择一块完全不与os-bin重合的空间，用于放代码；至于userstack和kernelstack仍然在os-bin的.bss内

> 缓存分成 数据缓存 (d-cache) 和 指令缓存 (i-cache) 两部分，分别在 CPU 访存和取指的时候使用。 通常情况下， CPU 会认为程序的代码段不会发生变化，因此 i-cache 是一种只读缓存。 但在这里，我们会修改会被 CPU 取指的内存区域，使得 i-cache 中含有与内存不一致的内容， 必须使用 fence.i 指令手动清空 i-cache ，让里面所有的内容全部失效， 才能够保证程序执行正确性

特权级的切换：这里考虑U到S的特权级切换

![记录特权级切换的相关信息的寄存器](image-1.png)
csr的rw操作是原子的

硬件工作：

- 当发生u级别的trap
- sstatus 的 SPP 字段会被修改为 CPU 当前的特权级（U/S）。
- sepc 会被修改为 Trap 处理完成后默认会执行的下一条指令的地址。
- sie 保存到spie并自动清零，这是riscv为了防止嵌套trap
- scause/stval 分别会被修改成这次 Trap 的原因以及相关的附加信息。
- CPU 会跳转到 stvec 所设置的 Trap 处理入口地址，并将当前特权级设置为 S ，然后从Trap 处理入口地址处开始执行

- 当发生sret
- CPU 会将当前的特权级按照 sstatus 的 SPP 字段设置为 U 或者 S ；
- CPU 会跳转到 sepc 寄存器指向的那条指令，然后继续执行。

用全局变量的方式，在.bss段申请kernel-stack和user-stack【注意在linker/entry.asm中声明的boot_stack_top用于call main时使用，支撑这第一个程序运行，call只存储pc到ra并jump，仍使用这个boot_stack直到运行应用程序更新sp】，与boot-stack无关，在.bss其他section

保存context：先交换sscratch【内核栈】和sp【用户栈指针】，在内核栈上保存通用寄存器，保存csr，最后从sscratch获取用户栈指针存储到内核栈，将这个内核栈指针作为参数传给trap_handler

在 RISC-V 中，call（即 auipc + jalr）的硬件动作仅限于设置 ra (x1)：把返回地址（下一条指令地址）存在 寄存器里，和设置 PC：跳转到目标函数；通过函数体内prologue完成，好处是leaf-function可以减少存储ra到栈

为了避免进入内核态后多次函数调用丢失存储的context位置，不是使用当前sp而是结构体kernel-stack的方法返回固定地址；运行app时在这里先放入新建的user_stack，再传入这个栈顶指针给restore；restore更新内核栈指针也使用这个指针更新，相当于强行更新了kernel-stack的指针为栈顶，而前面load app把0x80400000覆盖，这里restore后返回user-stack也是使用刚刚初始化的新栈帧和指针，从而所有空间都被覆盖【restore的效果是把传入参数视为context开始点，恢复到寄存器，恢复sp+context大小 并sret】

常用let slice = unsafe { core::slice::from_raw_parts(buf, len) };获取一串内存内容
sscratch 是何时被设置为内核栈顶的？ 是第一次从main的run_next_app调用restore，context恢复后的sp【内核栈顶】与scratch【restore一开始把新建的sp存入scratch】交换，从而写入scratch为内核栈顶

### Chap 3：多道程序处理

#### 2026年3月24日

main中声明mod，用pub mod声明的模块允许main中其他模块通过crate::访问；基本准则是：父模块看不到子模块的私有内容，子模块可以看到父模块的所有内容；注意src/下的多个rs文件实际是module，src/bin下是crate

![定义时的访问控制](image-2.png)

sie是中断使能寄存器，每一位标志启用什么中断；通过启用时钟中断，用sbi指令设置指定ticks后引发时钟中断【RISC-V 要求处理器维护时钟计数器 mtime，还有另外一个 CSR mtimecmp 。 一旦计数器 mtime 的值超过了 mtimecmp，就会触发一次时钟中断；sbi指令就是设置mtimecmp为当前时间+10ms对应的ticks，CLOCK_FREQ是与平台绑定的一秒内mtime的增量，set_timer(get_time()+CLOCK_FREQ/TICKS_PER_SEC)这里除TICKS_PER_SEC=100则表示一秒中断100次】
为了实现多道程序，初始化时把所有app读到内存，依次排列在APP_BASE后；为了实现分时复用，初始化时设置定时时钟中断，中断触发后切换运行的应用程序，并设置下一个时钟中断倒计时；也需要引入task管理app的上下文和运行状态【结束与否】，甚至还有若干个内核栈和用户栈，这task是进程的雏形
__switch实际在存储当前reg到cur_cx,加载next_cx到寄存器

为什么TaskManager要包裹inner？使用变量与常量分离的编程风格，总app数编译后不变，但是task状态和cur_task运行时变化
初始化app_cx时，令cx返回各自的user-stack，ra是各自app的开始地址

> 默认情况下，当 Trap 进入某个特权级之后，在 Trap 处理的过程中同特权级的中断都会被屏蔽。
> 当 Trap 发生时，sstatus.sie 会被保存在 sstatus.spie 字段中，同时 sstatus.sie 置零， 这也就在 Trap 处理的过程中屏蔽了所有 S 特权级的中断；
> 当 Trap 处理完毕 sret 的时候， sstatus.sie 会恢复到 sstatus.spie 内的值
> 也就是说，如果不去手动设置 sstatus CSR ，在只考虑 S 特权级中断的情况下，是不会出现 嵌套中断 (Nested Interrupt) 的

在 Rust 中，如果你声明了一个变量但没有给它初值，这个变量处于 “未初始化” 状态。第一次给它赋值的操作不叫“修改”（Mutation），而是叫“初始化”（Initialization）

```rs
    let res;
    unsafe {
        SYSCALL_COUNTER[SYSCALL_TRACE]+=1;
        res=SYSCALL_COUNTER[_id];
    }
    res as isize
```

### Chap 4：地址空间

#### 2026年3月26日

linker.ld的ENTRY(_start)不影响elf的布局，而是标记_start的地址为程序开始的地方【在elf的e_entry字段写入，并不是必要的，删除也可以跑】；而BASE_ADDRESS=0x80200000是说所有地址offset基于此

core::alloc定义了一套标准接口和元数据：
Layout描述多大的空间和对齐要求；#[global_allocator]标记一个实现GlobalAlloc特征【包括alloc/dealloc方法】的结构体static实例，作为heap内存分配器；#[alloc_error_handler]标记一个fn，在标记的global_allocator分配失败【alloc返回空指针】时调用这个函数，通常包括panic!停止运行

buddy-system：一种heap分配方法，维护32条链表，分别保存2^i大小的块；当存在相同大小的连续两块，则合并放入高一级链表；分配时总是分配一块大于等于需要大小的2的幂次大小的块，每回收一块内存在本级链表只需要一次异或检查是否存在buddy即可【一次回收至多log(totel-memory)次检查和合并操作】；缺点在于，如果不为“伙伴”，即使物理上紧挨着，它们也绝对不会合并；另外总是分配2的幂次大小，即使33B也需要分配64B

bitflag!宏用于标志位，实现更安全的加标志
原本使用整数位运算加标志，可能把不属于这个值的标志位或到值上【可能会不小心把一个“文件权限标志”加到一个“进程优先级”整数上，编译器不会报错】；bitflag!包含一个结构体【私有字段u8】，和结构体内的若干关联常量标志位[定义为本结构体类型]，实现了本结构体的位运算和display【strcut::empty()返回0对应的结构体】；从而避免了使用本结构体内关联常量【标志位】和其他不同意义标志位运算【没有定义】，通过.bits访问u8具体值，通过from_bits_*等方法从u8转为struct

> “关联常量（associated constant）”指的是：定义impl在类型（struct/enum）或 trait 内部的常量
> struct定义和impl时的泛型约束是分开的，这是为了允许impl是为特定泛型实现方法
> IntoIterator特征的item关联类型决定每次.next()返回值，IntoIter关联类型决定into_iter()返回什么，对谁调用next();iter/iter_mut/into_iter实际上是对&T,&mut T,T的Intoiterator方法调用into_iter方法，T的iter只是调用自己引用的into_iter()
> 在 SV39 模式下，虚拟地址是 39 位，而物理地址是 56 位，页内偏移12位；MMU认为虚拟地址63-39位必须与第38位相同，否则触发pagefault；![satp寄存器的最高位决定是否启用SV39](image-3.png)

frame_allocator是分配内存中内核之外的空间，heap_allocator分配linker中在内核内设置的bss段空间【用buddy-system】,user-stack和kernel-stack

在 RISC-V 架构中，satp（Supervisor Address Translation and Protection）寄存器是开启虚拟内存的开关，一旦你把根页表的地址填进这个寄存器，CPU 就会立刻从“直接访问物理内存”切换到“通过页表翻译地址”的模式

页表拥有各级页目录的所有权，在walk的途中，申请页并加入页表的frames中；map(va,pa)实际上是找到三级页表中对应的pte把pa的ppn写入；translated_byte_buffer把传入的虚拟地址翻译为对应物理内存上的内存切片的&'static mut

fence数据屏障协调ld和sd，要求之前的内存操作必须立刻让其他核心看到，不flush所有cache，而是让自己之前的内存操作被缓存一致性协议保护后才执行之后的操作【缓存一致性协议（如 MESI，通常保证D-cache一致）：当一个核写了数据，Cache 硬件会自动通知其他核该数据失效,之后其他核可以通过d-cache之间的routing获取最新版本】；fence.i先写回D-cache到内存【这是为了把刚刚写入内存APP_BASE的指令真的写回内存，因为i-cache不参与缓存一致性协议，不会问谁有最新副本【自己的d-cache有】而是直接内存取】，之后清空I-cache，之后重新从内存取指令填充i-cache；sfence.vma针对MMU，flush清空TLB

每个user-app对应一个页表，user-stack在映射elf到页表之后分配到连续的虚拟地址，之后预留用户heap的空间，在顶部分配trampoline页；全局的kernel页表在trampoline内存地址空间顶下，对每个app分配一块kernel-stack
从elf加载应用程序，和用linker加载kernel都把对应的bin纳入map-area管理范围; 但是各个app的具体代码elf还是linker链接到os.bin的data段中；new_kernel是os-bin整体创建一个内核态页表，form_elf是对若干在os-bin内部的app创建页表，顺便创建用户栈和trap_context的存储页
所以，每个app有一个user-stack【自己页表中】，一个kernel-stack[全局页表中]，有一个用户堆【自己页表的stack之后的空间】；全局页表也有自己的堆【.bss中用buddy-system管理】，但是内核并没有全局stack【只有boot-stack】

一个Memory-set维护一张pagetable和若干个虚拟地址范围map-area，map-area维护物理页并负责释放ppn【实际上就是把ppn放入recycled队列中】

> 所有权是一种设计逻辑，一种编译期检查：具体实现通过move和copy规则，arc实现多所有者，是因为它实现的特殊drop和copy方法，arc变量自己仍然单所有者，保护的数据的所有权在ArcInner，而堆上的ArcInner是unsafe申请的裸指针指向的，裸指针即是arc这个栈上变量，arc到arc-inner由于是unsafe创建，没有所有权

trampoline虚拟地址处load trap.S的__alltraps和__restore,并把这里TRAMPOLINE虚拟地址设置为用户态的stvec；进入trampoline运行__alltraps，存储context并加载内核态的satp、trap_handler地址、本app的kernel-stack，最后切换satp[此时才使用内核页表，也就是说context存储在用户页表],sfence.vma并跳转到trap_handler[只在内核态地址空间可见]

trap_handler先把satp设置为从s进入trap的处理函数__trap_from_kernel【转换sp指针到预留的emergency-stack，调用trap_from_kernel()进行panic!】,最后调用trap_return()[先设stvec为TRAMPOLINE【user-trap的处理函数】，fence.i后jr到__restore的va；__restore中切换satp，sfence.vma]

> asm!可以使用占位符："{position}" ,position= in(reg) local_var
> 在 Rust 的 asm! 宏中，options(noreturn) 告诉 Rust 编译器：“这段汇编代码执行后，程序永远不会跳回到这里继续运行。”

load-elf时需要elf文件头的entry-point
有两种context，切换_switch时的context【task_context】和trap前的context【更大更全】
![两种context](image-4.png)

pte的a与d：
A (Accessed) 位：内核会定期扫描页表，检查 A 位，如果 A 为 1，说明这个页面最近被用过，属于“热数据”，不应该被换出到磁盘。内核读取完 A 后，会手动将其清零。如果下次扫描发现它又变回 1 了，说明它依然很活跃。通过这种方式，内核可以统计出哪些页面长期 A 为 0，从而优先把它们踢出物理内存。
Dirty位：如果D=1说明本虚拟页被修改了，需要swap-in后才能释放物理页

> 当你执行 satp::write(token) 开启分页后，每当 CPU 执行一条代码（比如 ld t0, (a0)），硬件 MMU 确实会自动按照 SV39 协议去“翻页表”，更新TLB
> 手动的walk不是为了一般的内存访问，而是为了建立/解除映：通过修改pte

ELF的内容：ELF-header，若干个 program header，程序各个段section的实际数据，若干的 section header
一个典型的 ELF 文件中，Section 和 Segment 的对应关系通常如下：segment/program header给loader看决定如何加载，section给链接器看【ELF是可执行可链接文件】
Segment 1 (Read/Execute): 包含 .text, .init, .plt 等。
Segment 2 (Read Only): 包含 .rodata, .eh_frame 等。
Segment 3 (Read/Write): 包含 .data, .bss 等。

sscratch通过第一次运行的app程序上台时，跳转trap_return运行__restore用user-space的trap-context初始化sscratch
asm使用call < 符号>时，要考虑符号在bin中的地址和使用sv39后的虚拟地址，__alltraps现在改用jr而不是call，就是因为call会直接使用.text段的bin中trap_handler地址作相对寻址，但此时在user-space中，trampoline只在高位有映射，而不在os-bin中trap_handler符号所在的地址

core::from::raw_part接受\*const u8,&T需要先转换为[\*const T],再转换为*const u8；find 要求闭包的参数必须是项的引用，即 &Self::Item，如果是iter_mut的迭代器[Item=&mut T]，则闭包元素为&&mut T

##### Chap4 错误总结

两个半开区间 [self.l, self.r) 与 [l, r) 重叠的正确条件是：l <  self.r && self.l  <  r
总结
  ┌──────┬────────────────────┬───────────────────────────────────┬──────────┐
  │ 编号 │        位置        │               问题                │ 严重程度 │  
  ├──────┼────────────────────┼───────────────────────────────────┼──────────┤  
  │ 1    │ syscall/process.rs │ mmap/munmap                       │ 致命     │
  │      │                    │ 操作内核空间而非用户任务空间      │          │  
  ├──────┼────────────────────┼───────────────────────────────────┼──────────┤  
  │ 2    │ syscall/process.rs │ mmap 权限没有设置 U 标志位        │ 高       │
  ├──────┼────────────────────┼───────────────────────────────────┼──────────┤  
  │ 3    │ mm/address.rs      │ is_overlap 无法检测完全覆盖情况   │ 高       │
  ├──────┼────────────────────┼───────────────────────────────────┼──────────┤  
  │ 4    │ mm/memory_set.rs   │ unmmap 完全删除时未清页表项       │ 中       │
  ├──────┼────────────────────┼───────────────────────────────────┼──────────┤  
  │ 5    │ mm/memory_set.rs   │ unmmap 边界 VPN±1 计算错误        │ 中       │
  └──────┴────────────────────┴───────────────────────────────────┴──────────┘  

错误1：buffers.is_empty() 永远不会触发
translated_byte_buffer 内部有page_table.translate(vpn).unwrap()。对于未映射的地址，unwrap() 直接 panic内核，永远不会返回空 Vec。所以那个 -1 保护是死代码。

错误2：不检查 U 标志位
translated_byte_buffer 只取物理页，不检查 PTE 的 U（用户可访问）标志。这意味着内核页（如trampoline）如果在页表里能找到，也会被读取——这是安全漏洞。

错误3：usize::MAX 触发无限循环→OOM（最严重的运行时 bug）
translated_byte_buffer 对 usize::MAX 的处理过程：

```rs
  ptr = 0x7FFF_FFFF_FFFF_FFFF
  end = ptr + 1 = 0x8000_0000_0000_0000  // ← usize 加法，不溢出

  // 循环第一次：
    start_va = VirtAddr::from(ptr) = VirtAddr(0x7F_FFFF_FFFF) // ← 39位截断
    vpn      = 0x7FFF_FFFF              // ← 正好是 trampoline 的 VPN！
    // translate 成功（trampoline 有映射）→ 取到 ppn
    vpn.step() → 0x8000_0000   // **注意这里的step没有越界处理**
    end_va = VirtAddr(0x8000_0000 < <  12) = VirtAddr(0x8000_0000_0000)//  ← 超出39位
    end_va = end_va.min(VirtAddr::from(end))
           = end_va.min(VirtAddr(0x8000_0000_0000_0000 & 0x7F_FFFF_FFFF))
           = end_va.min(VirtAddr(0))    //  ← 0x8000... 高位被截掉变 0！
           = VirtAddr(0)
    v.push(...)
    start = usize::from(VirtAddr(0)) = 0

  // 下一次循环：
    while 0 <  0x8000_0000_0000_0000 // → true  ← 永远为真！
    // → 不断往 Vec push，直到 Vec 需要 16MB 扩容 → OOM

```

根本原因：usize::MAX【step自增之前的结果】 和 trampoline 共享同一个 VPN（0x7FFFFFFF），translate 成功了，但随后
end_va 因位截断归零，start 随之归零，陷入死循环。

insert_framed_area 把 MapType 改成了 LazyFramed，导致内核栈也变成懒分配。内核栈没有物理页，内核一写栈就触发kernel-mode PageFault → panic。

原则：懒分配只能用于用户空间的 mmap 区域，内核栈和内核空间必须立即分配

lazy_allocate初始化有两种处理方式，可以不在页表中存储pte，即pte.is_vaild==false，只在map_area中有，之后page_fault时写入pte并分配；或者分配无效pte，pagefault再补充，此处选用后一种

### Chap5：进程管理

#### 2026年3月28日

rustup用于管理rustc版本，管理不同版本rustc使用的core库；启动cargo和rustc实际上经过rustup的代理；
rust-toolchain 选工具【负责rustc版本，rustup工具】，Cargo.toml 选零件【定义项目metadata和依赖库，优化选项】，.cargo/config.toml 设编译参数【指定target架构和链接脚本，负责编译指令，运行配置】

rcore通过物理页号Phynum的方法get_byte_array获取实际存储
rcore【以及现代操作系统】引入VMA与页表一起管理内存，提供了以下优点：简化权限检查【不用查找页表树】，允许批量修改权限，支持文件映射内存【等复杂的内存映射】；VMA管理虚拟存储属性和data_frame,pagetable管理root_ppn和页目录页frames；此外，还允许先分配data_frame,再映射到pagetable上，这被包装在MapArea的map(pgtable)方法中，可以先分配data-frame的物理页，再调用pgtable.map()【这又会创建pgtable涉及的物理页】；综上，VMA允许我们根据仅有的VPNRange建立全套页目录和数据页

Slice 的本质是(Pointer, Length)，存储虚拟地址，所以不能跨satp传递；单核心的访问控制通过禁用中断实现，要求获取锁时不允许中断，保证不会获取一半打断；多核心的访问控制通过原子命令实现，具体有spin-lock/Mutex通过原子交换保护、无锁数据结构通过CAS直接修改
cell和refcell只是为了实现内部可变性，不具有Sync或Send特征保证跨线程/进程安全

pagetable和maparea实际上不拥有页对象的所有权，而是针对每个页对象有一个标识符/id,对这个id的释放和分配；对页的释放最终归结到FrameTracker，把物理页号从FRAME_ALLOCATOR中移动到recycled内

run_task循环：Processor从task_manager中move走一个task,装入自己的cur_task，加载ctx后__switch，注意processor自己有一个idle_ctx用于保存循环状态；当task运行到suspend进入内核态，会先把当前processor的task设ready后加入task-manager，然后__switch到processor的idle_ctx，这样重返循环，在循环中再取task装入processor的cur_task

exec沿用了原进程的id、内核栈、进程树和调度状态

> user为了支持bin中的应用程序，给出了lib/console等crate，包含syscall调用的封装，和这些封装之上的软件console_buffer【用于print】
> 关于Backspace，user-console会把BS这个字符送给sys_write,sys_write会把BS最终交给sbi，sbi对BS的操作是光标左移；所以为了实现显示的正常，需要BS-space-BS;至于BS对实际read，是通过shell内维护一个string，读到BS时pop，最终调用程序用这个string；sbi的console_Read是立即的，如果硬件中有则返回，没有则返回-1
> 以上可见通过维护一个string来保存用户实际意图，维护一个直接处理字符的逻辑以实现实时显示，所以实际上是通过sys_exec传递user-space中存储string的va-ptr实现读取输入，sbi的getchar\putchar只负责键盘到sbi、sbi到屏幕
> 对于sys_exit的进程，它的子进程全部交给INITPROC【loop wait】，自己则等待自己的父进程wait

为什么TCB需要标出sp：因为每个应用程序大小不同，sp在elf之后的一页，所以位置不是固定的
sys的异步结果可以设计为立刻的，等待轮询让用户库做

#### 2026年3月29日

kernel的heap用buddy-system管理bss内的HEAP_SPACE, user-space的heap实际是sbrk申请，由用户lib管理【用户lib在用户的bss段设置一段空间HEAP_SPACE,并也用buddy-system管理】

stride进程调度：由于 stride 是一直累加的，无论你的 BigStride 设为多少，最终都会超出 u64 或 u32 的最大值；保证最大stride类型/2 > pass数据类型最大值，即最大步长小于存储类型最大容量的一半），那么我们就可以通过 a.stride.wrapping_sub(b.stride) <  BigStride 这种方式来安全地比较，即使发生了回绕，差值的符号位依然能正确反映谁更“小”

这一节主要贡献：增加了pid1的shell，增加了pid0的initproc，进程父子和回收【更改了应用程序的退出机制为processor的idle-proc】，exec、waitpid等系统调用；抽象了processor，实现与task-manager分离

### Chap6：文件系统

#### 2026年3月29日 continue

关于特征对象dyn T，内存中对应一个(指针，vtable)二元组，指针指向具体地址，vtable则包含**本特征**在**本类型上的实现的特征方法**的地址，这张表通常存储在可执行文件的 .rodata（只读数据段） 中，在程序加载时就已经存在了

> 虚函数表（vtable）既不属于某个具体的实例对象，也不仅仅属于某个 Trait。它是 （具体类型 T, 特征 Trait） 这个组合的唯一标识，
> 如果你有 struct Dog 和 struct Cat，它们都实现了 trait Animal：
>
> - 编译器会生成一张 Dog as Animal 的虚表。
> - 编译器会生成一张 Cat as Animal 的虚表。
> 如果 Dog 还实现了 trait Pet：
> - 编译器还会额外生成一张 Dog as Pet 的虚表。
> 只要程序中出现了将 Dog 转型为 dyn Animal 的代码，编译器就会在二进制文件中硬编码出这张表。

关于运行时反射 Runtime Reflection:指的是程序在运行过程中，可以动态地获取和操作自身的类型信息、属性、方法等结构，而不仅限于编译期静态确定类型
Rust基本不具有的运行时反射功能，只保留最低限度的运行时类型信息，相关的概念有：
TypeId 作为所有'static类型的唯一指纹，Any Trait 允许通过 downcast_ref 从Box< dyn Any>变为具体的T【let x: &dyn Any = &5_i32;形成时擦除类型信息，只通过vtable保留计算TypeId的函数，downcast_ref实际上就是通过对比TypeId完成有限的运行时反射】

#### 2026年3月30日

外设可以分为块设备、字符设备和网络设备，存储一般都是块设备；blk_device提供按blk_id读写块的能力，具体实现根据设备而实现；一般一个块设备对应一个blk_cache缓存，对应一个fs管理块设备；为了使用不同的文件系统，提出VFS层，提供按文件读写的api，向下兼容不同文件系统【块设备都是按块分配和定位访问】

FAT文件系统：每个文件用若干簇存储【一个簇是若干块】，相同文件的所有簇构成一个链表存储在FAT表中【FAT[10]=11表示11簇是10簇的后继，=0表示本簇未分配，=END表示本簇是文件的最后一个簇】；查找时从super-block读取根目录簇，其中每个entry包括文件名、首个簇等信息，这样逐层目录查找
Ext4文件系统：依靠bitmap、Inode管理块设备，一个inode对应一个文件，存储数据块的【文件内块编号-物理块号】的映射；目录项entry存储(name,inode_id)

iter.take(n)返回一个迭代器，包括iter的前n项
inode分为两种：一种disk-inode存储于磁盘，内部结构简单且固定【保存间接目录和data-block的物理块号】，用于描述文件；一种Inode保存在内存,存储了对应DiskInode的位置【blk_id\blk_offset】；索引编号从inode获得时可以分为三段【inode_block_id - block内u64的位置 - 这个u64的第几位】，（对于 Inode Bitmap 来说是 Inode ID，对于 Data Bitmap 来说是 Data Block ID），按bit编号【存在两种编号，一是块设备编号，二是bitmap编号】

![data-bitmap块数的计算方式](image-5.png)
实际上Disk-inode是在池中分配的，inode-area就是若干个DiskInode构成的数组；

从现在起使用fs，不再需要链接app到内核镜像中，而是依赖easy-fs-fuse脚本写入fs.img再在qemu启动时加载；此时fs.img被视为块设备，通过若干寄存器与os交互【VirtIOHeader】，并通过若干页【构成queue】dma实现硬盘读写【依赖提供的Hal的dma_alloc和dealloc方法】：虚拟块设备VirtioBlk初始化一个frame队列【用dma_alloc】，并把这些队列的物理地址写入VirtIOHeader的VIRTIO0寄存器，之后块设备调用read_block和write_block利用queue读写【这里是阻塞，从而不会出现地址空间的问题】

#### 2026年3月31日

fs只是把文件从内存移动到disk；现在的读取流程是，from_elf创建memory-set时调用fs的api将elf复制到物理页中【之前是从内核的指定位置拿，复制到物理页中】
fd-table是一系列实现了FILE-trait的特征对象指针，包括stdout/stdin【实现File时直接调用sbi接口】、OsInode[取内部的VFS inode调用方法->block_cache]
fs管理全局共享资源池【空闲块、空闲inode】但是不具体读写，具体读写交给block-cache；而vfs在分配资源时使用fs接口，获取资源时直接调用block-cache的方法，这样更快

本章节建立了kernel-space到user-space的统一访问路径UserBuffer【物理地址的切片】；建立了以基于文件的标准输出输入接口【为Stdout和Stdin实现File-trait】；不设置用户、软硬链接
每个进程都带有一个线性的 文件描述符表 ，记录所有它请求内核打开并可以读写的那些文件集合。而 文件描述符 (File Descriptor) 则是一个非负整数，表示文件描述符表中一个打开的 文件描述符 所处的位置（数组下标）；None表示None的占位符

![easy-fs的层次结构](image-6.png)
Inode、Osinode实际存储在内核堆，通过arc链接到进程的fd_table; disk-inode在blk-cache中

qemu命令
11          -drive file=$(FS_IMG),if=none,format=raw,id=x0 \
12          -device virtio-blk-device,drive=x0,bus=virtio-mmio-bus.0
第 11 行，我们为虚拟机添加一块虚拟硬盘，内容为我们之前通过 easy-fs-fuse 工具打包的包含应用 ELF 的 easy-fs 镜像，并命名为 x0 。
第 12 行，我们将硬盘 x0 作为一个 VirtIO 总线中的一个块设备接入到虚拟机系统中。 virtio-mmio-bus.0 表示 VirtIO 总线通过 MMIO 进行控制，且该块设备在总线中的编号为 0【这也确定了把块设备的控制寄存器映射到内存的地址 0x10001000 ，MMIO的第一个接口】

> 内存映射 I/O (MMIO, Memory-Mapped I/O) 指通过特定的物理内存地址来访问外设的设备寄存器。查阅资料，可知 VirtIO 总线的 MMIO 物理地址区间为从 0x10001000 开头的 4KiB

VirtIOBlk 与Hal：前者是驱动整体，依赖一个Hal的特征对象和一个VirtIOHeader与设备交互
VirtIOBlk初始化时登记VirtIOHeader的地址，之后通过这个面板控制设备；初始化时使用Hal对象的dma_alloc方法为自己分配缓冲区【在kernel-space中】，用于存储之后的操作指令；调用VirtIOBlk.read(blk_id,buf)时，传入的buf是kernel-space地址，设备的dma需要phy-addr，这通过Hal的virt_to_phys和phys_to_virt实现转化；将buf转为phyaddr，与blk_id一同存入缓冲区，并在IOHeader置位等待操作完成
IOheader操作块设备，Hal操作内存【Queue的定位和分配也依赖Hal】，他们的使用都被包装在VirtIOBlk的方法中

### Chap7：管道

#### 2026年4月1日

关于arc和weak：
arc内部维护strong和weak计数，当strong>0，weak.upgrade()把自己变为strong，strong计数+1,weak计数-1；如果strong计数==0,则upgrade返回None

Pipe的读写：只有所有write-end关闭后才能认为没有可能的输入，停止等待读取【当write-end还存在arc时，read-end.read()如果看到buffer中没有可读取内容，需要等待】
pipe结构体可以视为**接口**，根据字段属性可以分为读pipe和写pipe【作为两个文件，一个RDONLY，一个WRONLY】，持有buffer的arc指针；pipe也分配在堆上，进程持有pipe的arc指针；buffer持有对write-end-pipe的weak指针，从而可以通过尝试upgrade weak指针来判断，这个写端pipe是否存在【其他进程持有的】arc指针，决定在buffer可读内容为0时要不要继续等待
实际上最重要的是buffer，pipe只是为他加上读写接口；由于pipe-buffer大小有限，没有读写内容时且write端没有都关闭时就会switch

exec的压栈过程：
shell捕捉输入并按空格拆分，检查输入输出重定向，为addr-vec和string-vec补充尾0移动到堆上,传入sys_exec[shell是用户态应用程序]
sys_exec传入的是用户态的指针数组首地址，从中取出所有string，调用exec；exec会把user-sp下移出n个usize的空位存储输入参数的地址，输入参数存储在这些地址之下【继续压栈】，注意user-stack中的地址是user-space的地址；最后形成user-stack空间顶部先是n个user-space的栈上地址，然后是若干string【对应栈上地址】；最后在a0\a1寄存器存储参数个数和base-addr
这需要用户程序的_start配合，从a0\a1中读取string，作为vec传入main

本实验还实现了输入输出重定向，这在把stdin/stdout/file/pipe均抽象为File的背景下是容易的，只需要把fd从stdin/stdout修改为文件即可

### Chap8：并发

#### 2026年4月2日

引入Thread实现应用作为进程内部的并发，在有了线程后，对进程的定义也要调整了，进程是线程的资源容器， 线程成为了程序的基本执行实体【线程是可以被操作系统或用户态调度器独立调度（Scheduling）和分派（Dispatch）的基本单位】

互斥锁、信号量和条件变量都是实现多访问一致性的方法，但是应用场景不同【互斥锁保护critical-session，信号量保护有限资源，Condvar基于Mutex实现等待唤醒[增强Mutex]】

> RefCell 内部的计数器逻辑RefCell 内部维护一个 isize 类型的状态位（通常叫 borrow）：0表示未被借用；正数表示当前有n个不可变引用（borrow()）；-1表示当前有一个可变引用（borrow_mut()）；通过检查可变引用记数，实现SingleProcess单核的访问一致性

信号量：Count是资源数目，为正时表示有空闲资源，为负时表示有需求未满足
如果获取到信号量.down()不阻塞直接继续运行；反之会阻塞直到获取信号量后继续运行；Semaphore内部维护TCB队列，up时取出一个并继续执行，down时如果没有空闲资源则block当前线程

Mutex互斥锁，设计为lock、unlock的特征
实现为MutexSpin自旋锁【locked时放弃process，等待下次线程上台检查】和MutexBlocking阻塞锁【locked时当前tcb加入队列，unlock时检查队列获取锁】
前者获取锁依赖os线程调度顺序【在申请锁线程看来，自己一直在自旋；os看来，若干个申请锁线程上台后一直在自旋】，后者获取锁的顺序与申请锁的顺序相同【在申请锁线程看来，自己直接拿到锁】

Condvar条件变量：维护一个tcb的队列
对条件变量调用signal()时唤醒队列首部的task；调用wait(mutex)时释放锁，把当前tcb放入队列，进入sleep状态等待唤醒，唤醒后获取锁

> Parital Ord/Partial Eq允许部分对象无法比较【返回Option< Ordering>】
> Eq是标记特征，表示Partial Eq实现了自反性【每个对象与自己是Parital-eq的】

现在引入线程代替进程作为os调度的最小单位，实现上通过加入PCB管理若干TCB：tcb拥有指向进程PCB的weak指针，pcb有指向线程tcb的arc指针
把线程独立于进程的资源集中在TCB【kernel-stack,每个thread有自己的kernel-stack，从kernel-space的trampoline开始向下分配trampoline-i*(stack_size+page_size),i是kernel-stack的id】、TaskUserRes[用户栈、用户trap-cx]:用户栈分配在加载的elf的末尾【user_stack_base根据elf的大小变化】开始的i*(user_stack_size+PAGE_SIZE),用户trap_cx分配在trampoline下的trap_base开始的往下若干页，i是本进程内的tid【thread_id】

进程内部维护Mutex、Condvar、信号量的向量，包装为系统调用创建、加锁[指定mutex_id]

#### 2026年4月3日

process由PID2PCB的二叉树小根堆管理arc指针，此外只有task【thread】有weak指针
引入线程后，sys_create创建线程，sys_fork创建进程

Vfs-fs-BlockCache
Vfs只涉及Inode面向文件,fs负责存储设备布局和分配空间，blk_cache负责块的IO缓冲；vfs面向其他内核模块，内部使用fs、blk_cache的api完成面向文件的工作

释放当前线程时可以直接释放tcb【从task-manager中】，因为此时process的pcb内还保留tcb的arc指针，从而不会释放正在使用的kernel-stack；如果释放的是主线程，则需要在释放tcb的同时释放pcb；这需要我们先保存当前tcb的kernel-stack指针到task--manager的stop-buffer中，从而保证正在使用的kernel-stack不丢失；当下一个主线程tcb释放时挤占task-manager中stop-buffer，之前的主线程tcb就被释放

临界区是访问共享变量（或共享资源）的代码片段， 不能由多个线程同时执行，即需要保证互斥；可见对于“共享资源”的访问需要保证互斥，而“共享资源”只在多线程的情况下出现
多线程的最终执行结果不确定（indeterminate），取决于由于调度导致的、 不确定指令执行序列的情况就是竞态条件（race condition）

信号量可以有两种实现：不允许信号量小于0,和允许信号量小于0，下面使用后者
利用信号量可以实现互斥访问【n=1】，条件访问【n=0仅当其他线程需要时调用V才处理】，阻塞队列【producer-consumer模型，需要三个信号量配合，n1=1保障互斥，n2=0表示当前可用数量用于消费者判断，n3=n表示缓冲区可用数量用于生产者；produce/consume时先消耗n2/n3，再消耗n1，最后增加n1,增加n3/n2】

管程Monitor：实现SingleProcessor下的资源一致性保护，与信号量是等价的
是一种程序结构，结构内的多个子程序（对象或模块）形成的多个工作线程互斥访问共享资源；管程实现了在一个时间点，最多只有一个线程在执行管程的某个子程序
实现的方案有三，根据唤醒/阻塞的时间节点的不同
Hoare 语义：线程发出唤醒操作后，马上阻塞自己，让新被唤醒的线程运行。注：此时唤醒线程的执行位置还在管程中。
Hansen 语义：是执行唤醒操作的线程必须立即退出管程，即唤醒操作只可能作为一个管程过程的最后一条语句。 注：此时唤醒线程的执行位置离开了管程。
Mesa 语义：唤醒线程在发出行唤醒操作后继续运行，并且只有它退出管程之后，才允许等待的线程开始运行。 注：此时唤醒线程的执行位置还在管程中

同步异步是设计风格，前者在遇到子任务未完成时停下父任务来等待，后者考虑在子任务完成/不完成情况下的路线，保证父任务一直推进；这是在单个任务【线程】视角上的，在os视角上会 切换不同任务【线程】实现cpu减少空转

> 算法运行过程如下：
>
> 1. 设置两个向量: 工作向量 Work，表示操作系统可提供给线程继续运行所需的各类资源数目，它含有 m 个元素。初始时，Work = Available ；结束向量 Finish，表示系统是否有足够的资源分配给线程， 使之运行完成。初始时 Finish[0..n-1] = false，表示所有线程都没结束；当有足够资源分配给线程时， 设置 Finish[i] = true。
> 2. 从线程集合中找到一个能满足下述条件的线程
> Finish[i] == false;
> Need[i,j] < = Work[j];
> 若找到，执行步骤 3，否则执行步骤 4。
> 3. 当线程 thr[i] 获得资源后，可顺利执行，直至完成，并释放出分配给它的资源，故应执行:
> Work[j] = Work[j] + Allocation[i, j];
> Finish[i] = true;
> 跳转回步骤2
> 4. 如果 Finish[0..n-1] 都为 true，则表示系统处于安全状态；否则表示系统处于不安全状态，即出现死锁。

这其实在检查 **一系列的加锁解锁操作** 下，会不会出现死锁
