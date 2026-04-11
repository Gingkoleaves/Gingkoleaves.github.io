---
layout: default
title: CS61C Notes
date: 2025-09-15
permalink: /notes/Note_4_CS61C/
categories:
    - notes
tags:
    - cs61c
    - c
    - risc-v
asset_subdir: Note_4_CS61C
---

# 2025 年 9 月 15 日

## Lec1:略

## Lec2:Number Representation

unicode 有 8、16、32 位的版本
binary Representation、hex、oct
原码反码补码
bias 的编码方式：把 0000~1111 前半段视为负数，后半段视为正数

## Lab0:Setup

basic commands and tools: Vim, ssh, git, man command...
grading stuff

## Lec3:Basics

java: 接近 c 方式，但是有解释器
rust: 强类型
go :处理多核多工作的问题

c compile: 先进入 macro-processor 执行 CPP commands【如#include 命令】、替换注释，再逐个编译为.o 文件，然后和库文件 link 形成 .out

> #define min(X,Y) (X< Y)?X:Y, 如何确定 XY 是宏参数而非简单的字符串
> 宏参数同时出现在宏体和宏定义中，且在宏体中不在字符串中也
> #define message(X) "Hello X"
> // 使用时：message(World) 会变成 "Hello X"（X 不会被替换）

C vs Java
前者 gcc 得到机器相关的代码 a.out；javac 得到机器不相关的代码（java Hello 运行 Hello 程序）
前者没有自动内存管理，后者有自动的 new 申请释放
前者存在 preprocessor【初步处理源代码】，后者不存在

## Lec4:C Basic

C Syntax
鼓励使用 intN_t 和 uintN_t 的类型定义方式，实现跨机器的运行【不同机器对 int 的字长定义不一致】
void\*通用指针
handle: 指向指针的指针 int \*\*h，被称为句柄

## Lec5: C Memory Allocation

malloc 返回一个 void 指针，指向通用的【无类型】的空间,从而往往左加一个个(int\*)
如果 malloc 失败，返回 null，所以要检查 null==ptr【null 卸载前面，防止写成 null=ptr】
![question1](image.png)

Memory Management
C 有三个内存池：静态、堆【动态申请的空间】、栈【local varible】
其中堆从低地址向高地址增长，栈从高地址到低地址增长;OS 维护二者区别
malloc 的好处在于，当申请大量空间会返回 null，而不是像申请数组一样报错

内存维护一个 free-list，包括所有堆中未使用的块的首地址和大小；malloc 时查询这个 free-list 看是否有可用的空间，并维护一个和 free 共享的申请表；free 先对照申请表找到本指针对应长度，然后将空间接入 free 并做一些内存处理；
维护了 free-list 和 used-list,这样才知道如何根据一个输入锁定空间
malloc 要开新一个栈帧来计算，所以速度比直接申请数组要慢
![example of stackframe](image-1.png)
Valgrind 是一个很好的 c 的静态代码检查工具,检查是否有内存泄漏
> $ valgrind --tool=memcheck --leak-check=full --track-origins=yes [OS SPECIFIC ARGS] ./<executable>

## Lab1：C base

gcc -g -o hello hello.c 这里的-g 使得 gcc 存储运行过程中的信息，以便 gdb 使用
进入 gdb 后，运行 run < "input.txt" 来实现传入参数而非交互式传入

![seg_error](image-2.png)
![is acyclic](image-3.png)

## Project1: Game of Life

> PPM: 一种 RGB 图像的存储方式
> P3 指的是 RGB 格式用 ASCII 表示；4 5 指宽、高；255 指每个颜色的范围 0-255；以下都是 pixel
> P3
> 4 5
> 255
> 0 0 0 0 0 0 0 0 0 0 0 0
> 255 255 255 255 255 255 255 255 255 0 0 0
> 0 0 0 0 0 0 0 0 0 0 0 0
> 0 0 0 0 0 0 0 0 0 0 0 0
> 0 0 0 0 0 0 0 0 0 0 0 0

预处理器会自动拼接相邻字符串，所以 PRIu32 会展开为类似"lu",通过"%" PRIu32 "\n"的格式化字符串使用

# 2025年10月6日

## Lec6: Fixed & Float
定点数确定小数点的位置
术语:mantissa/significand尾数

IEEE754标准: normalized form 省略小数点前的1
underflow->0;overflow->infinite

![IEEE754](image-4.png)
指数biase表示，尾数原码
为什么这样定义NaN：因为在nan和其他数的运算中，结果总是保持为nan
可以将NaN的具体值与错误信息匹配：比如指定某个NaN编码对应某个报错
为什么定义infinite:因为这样对于最大的规格数增加一点就得到正无穷
非规格数是去掉首1,指数取值为00000001对应的指数而不下降

precision是用于表示数的位数; accuracy 是真实值和计算机表示的区别
Rounding: 舍入规则
Round to +inf/-inf/0/unbiased[四舍五入;2.5 to cloest even number]

fp16\fp32\fp64\Quad-Precision:binary128
bfloat16: 相比bp32,保持指数位，只减小尾数位；范围不变精度下降
U-bits标志是否是舍入后的值; Unum标准可以指定Exponent和mantissa的位数

## Lec7: RISC-V Intro

Instruction Set Architecture: 指的是特定于一类处理器的指令集
ARM ISA: in phone;
Intel x86: in PC;
MIPS\ RISC-V【一开始是教学用，后续商业项目开展】

ISA用于汇编语言，每个汇编语句调用一个ISA指令
本课程使用RISC-V32

**Explain some assembly language instruction**
为什么没有subi，因为可以addi补码
add x1,x2,x3	x1<=x2+x3
lw/sw [regs],[mem]	allow to sw/lw a immedia
offset必须和使用的save命令匹配：saveword要存到offset为4*byte的地址
结果存储/读取到reg的低字节，注意这里存在sign extension[load byte into 32bits registers]

X0寄存器硬编码为0,不可以改变，因为计算机总是需要一个0

## Lec8: RISC-V Basic Instructions

imm立即数存储在指令中
low-endian: RISC—V使用小端序，对于一个字，低位存储在低字节
90%处理器用小端序；小端序只决定如何存储字节【计算机通常是字节编址】

for single read, register compares to Memory faster for 50 times
【电脑的盘都是Disk，看不到Memory; Pc一般有2-10G memory】

add\sub\addi\lw\lb\lbu[lb to a 32bits reg need decide sign extension]\sw\sb

decision making parts: branch statement, can't compare a reg to a immedia
beq\bne: check if 2 regs equals and decide to exec different instruction
blt[u]\bge[u]: branch if low than/ branch if greater than
j: jump

常用想法是，如果不满足if条件，则跳过if内语句
语句按以下顺序: branch up[如果不满足条件，就跳到branch down]-满足条件的执行-J to exit-branch down- exit
汇编的顺序和if语句有细微不同

## Lec9 RISC-V Decisions II

and\xor\or\sll\srl\sra[insert sign bit into high position]: two variant for reg and immed
不存在NOT操作: 可以被XOR 0xffff代替

source file -> [assembler] -> object file -> [linker] -> executable file
32bits for every instruction in RISC-V in memory

Symbolic register names: 为部分寄存器起名,用于专用用途，例如x10-x17=>a0-a7用于存储函数调用的参数；x1=>ra返回地址
Pesudo-instruction: 为部分晦涩的指令起名，例如mv rd,rx = addi rd,rs,0

function calls steps:
1. put arguments where funciton can access [use reg instead of mem: a0-a7] [store ra happens here]
2. transfer control to function 
3. acquire local storage
4. perform task of function
5. place return value where calling code can access [usually a0-1]
6. return control [use reg x1 called RrturnAddress, store ra before enter the function]

Pesudo-code
jal[jump and link, actually link and jump]: save next addr and jump [zip 'save RA' and 'jump to func' together]
jr[jump reg]: use in the end of function [jr ra]

Leaf function: 不调用其他函数的函数
存储现场到stack[grows downwards]中，sp[stack pointer] store in x2

## Lec10: Procedures
function call:
Prolog: move sp for save regs use afterwards; save regss[移动指针，存储之后要用到的寄存器的内容]；移动sp，存储sp等s开头的寄存器，存储RA
exec
epilogue: recover those saved regs, move up sp[恢复寄存器内容，恢复sp]
ret: jump back

为了减少需要保存到内存的寄存器，RISC-V将寄存器分为Preserved和temporart
认为前者在caller函数调用前后不发生改变【callee需要保存到stack中】；后者则是不可靠的，如果后者存在需要的数据，应当放到preserved-reg或者stack上
这样，caller只用存储temporary regs

一般来说，在函数调用中，在temporary regs的数据如果需要存储应当由caller存储，因为可能被callee覆盖；如果需要使用preserved regs，应当在callee中存内容到stack中，因为需要对caller保持preserved regs不变【实际上就是在callee开始部分存储，末尾恢复】

在一个函数体内要存储两种，一种是作为callee存储preserved到stack以便自己使用preserved的空间；一种是作为caller存储temporary到stack/preserved为自己的callee准备空间/保存现场

memory allocation:
自动变量【存在于函数调用内】，静态变量【第一次调用后总是不释放】
stack每个栈帧起点对齐16byte【即是16byte的倍数】
====内存布局
====HIGH
    stack
    heap
    static data
    text
    reserved
====LOW

# 2025年10月11日

## Lab2: Advance C

位运算和debug动态内存

Makefile命令格式：
target:prerequisites        # 本行只用于构建依赖关系
    [recipe]可选            # 本行是实际执行命令
会检查target是否“过期”【如果target是伪目标【不对应文件】，总认为是过期的】；如果过期，检查所有依赖是否过期，查找并应用他们的生成规则；这样递归地调用；
make包含若干隐含规则，例如.c.o自动构建.o的生成任务；还有若干convention，例如不进行.c/.h的生成任务【默认存在.c，如果不存在.c则报错】
“需要更新”会沿着依赖树上传：如果.h依赖.c，.o依赖.c,则.h晚于.c时，会尝试更新.c；又因为.c不会更新【是源文件】，所以上传到.o需要更新

lfsr:linear feedback shift register
用于产生伪随机数

 18  * The header file starts off with
 19  * #ifndef CS61C_VECTOR_H_
 20  * #define CS61C_VECTOR_H_
 21  *   
 22  * and ends with a final #endif.  This prevents the file from being included
 23  * more than once which could've possibly resulted in an infinite loop of
 24  * file inclusions.

通过以下方法，防止重复包含头文件导致的无限展开include[只会在第一次include时展开，因为只有第一次导入时没有define xxx]
ifndef xxx
define xxx
头文件内容
endif

## Proj2: RISC-V based Artificial Neural Network

> TSWBAT (“The Student Will Be Able To”) implement numerical computation functions in RISC-V assembly that follow calling the convention.
> TSWBAT call functions in RISC-V assembly.
> TSWBAT write RISC-V assembly programs that utilize the heap and interact with files.
> TSWBAT write a test suite that covers corner cases and automatically checks for the correct operation of the RISC-V functions implemented.

# 2025年10月13日

venus工作流程：本地启动服务器，挂载到61C提供的venus Web Interface上
但是本地这个venus版本对不上；也可以使用远程提供的服务器，只不过要上传下载文件夹

线上工作流程：改src的汇编代码.S,改unittest中的py，生成.S的测试文件，然后运行这些.S测试文件【在Risc上】
行主序存储二维数组；行主序下访问列向量需要step=行 地访问

python3 -m unittest unittests.TestRelu -v
-m调用unittest模块，运行unittests.py文件内的TestRelu类

# 2025年10月20日

python的unittest库在本地使用测试文件unittest.py产生并运行若干测试程序.S并调用venus执行返回结果；
web端连接本地venus,用于debug

如果需要递归调用函数，要在进入本函数时存储ra，因为call会直接写入ra=pc+4然后跳转
本项目的venus是32bits指令字长和寄存器字长