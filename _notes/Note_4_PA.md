---
layout: default
title: Trip to NJU_PA
date: 2025-09-22
permalink: /notes/Notes_4_PA/
categories:
    - notes
tags:
    - c
    - risc-v
    - qemu
---

# 2025年9月22日

## L2
ubuntu默认不给予root用户密码

> Ubuntu 官方手册
> By default, the root account password is locked in Ubuntu. This means that you cannot login as root directly or use the su command to become the root user. However, since the root account physically exists it is still possible to run programs with root-level privileges. This is where sudo comes in - it allows authorized users (normally "Administrative" users; for further information please refer to AddUsersHowto) to run certain programs as root without having to know the root password. 

vim: q录制宏

# 2025年9月27日

makefile用于简便地集中编译大量文件
makefile的规则如下：make指令自动调用定义的第一个任务；检查目标文件是否比所有依赖文件更加新，如果不是，则执行命令；当依赖为空，认为目标文件确实比所有依赖文件更加新；.PHONY: <目标> 会取消比较目标文件的新旧，视为“伪任务”总会执行对应命令

> 目标：依赖
> <tab>命令

git基础：
git branch只是开辟branch但不切换;git checkout会切换branch
fetch只是会拉取remote不同的commit连接在本地的commit历史上【名为/origin/master等】，不合并
pull=fetch+merge

# 2025年10月8日

PA目的是实现NEMU，一种简化的模拟器
make可以并行运行: 通过参数-j9指定使用9个线程编译
time [instructions] 测量指令执行时间

ccache: 提供一个gcc，使用该gcc会自动比较源文件是否变化，如果不变化就不需要重新编译，而是复用之前的目标文件
/usr/bin/ccache是一个可执行文件; usr/lib/ccache包含一堆符号链接到/usr/bin/ccache; man中把usr/local/bin/gcc等也连接到/usr/bin/ccache
ln -s /usr/bin/ccache /usr/local/bin/gcc
ln -s /usr/bin/ccache /usr/local/bin/g++
ln -s /usr/bin/ccache /usr/local/bin/cc
ln -s /usr/bin/ccache /usr/local/bin/c++

因此, ISA的本质就是类似这样的规范. 所以ISA的存在形式既不是硬件电路, 也不是软件代码, 而是一本规范手册.
计算机硬件是按照ISA规范手册构造出来的, 而程序也是按照ISA规范手册编写(或生成)出来的

> 两个互补的视角来看待同一个程序:
> 一个是以代码(或指令序列)为表现形式的静态视角, 大家经常说的"写程序"/"看代码", 其实说的都是这个静态视角. 这个视角的一个好处是描述精简, 分支, 循环和函数调用的组合使得我们可以通过少量代码实现出很复杂的功能. 但这也可能会使得我们对程序行为的理解造成困难.
> 另一个是以状态机的状态转移为运行效果的动态视角, 它直接刻画了"程序在计算机上运行"的本质. 但这一视角的状态数量非常巨大, 程序代码中的所有循环和函数调用都以指令的粒度被完全展开, 使得我们难以掌握程序的整体语义. 但对于程序的局部行为, 尤其是从静态视角来看难以理解的行为, 状态机视角可以让我们清楚地了解相应的细节.

nemu 结构
├── configs                    # 预先提供的一些配置文件
├── include                    # 存放全局使用的头文件
│   ├── common.h               # 公用的头文件
│   ├── config                 # 配置系统生成的头文件, 用于维护配置选项更新的时间戳
│   ├── cpu
│   │   ├── cpu.h
│   │   ├── decode.h           # 译码相关
│   │   ├── difftest.h
│   │   └── ifetch.h           # 取指相关
│   ├── debug.h                # 一些方便调试用的宏
│   ├── device                 # 设备相关
│   ├── difftest-def.h
│   ├── generated
│   │   └── autoconf.h         # 配置系统生成的头文件, 用于根据配置信息定义相关的宏
│   ├── isa.h                  # ISA相关
│   ├── macro.h                # 一些方便的宏定义
│   ├── memory                 # 访问内存相关
│   └── utils.h
├── Kconfig                    # 配置信息管理的规则
├── Makefile                   # Makefile构建脚本
├── README.md
├── resource                   # 一些辅助资源
├── scripts                    # Makefile构建脚本
│   ├── build.mk
│   ├── config.mk
│   ├── git.mk                 # git版本控制相关
│   └── native.mk
├── src                        # 源文件
│   ├── cpu
│   │   └── cpu-exec.c         # 指令执行的主循环
│   ├── device                 # 设备相关
│   ├── engine
│   │   └── interpreter        # 解释器的实现
│   ├── filelist.mk
│   ├── isa                    # ISA相关的实现
│   │   ├── mips32
│   │   ├── riscv32
│   │   ├── riscv64
│   │   └── x86
│   ├── memory                 # 内存访问的实现
│   ├── monitor
│   │   ├── monitor.c
│   │   └── sdb                # 简易调试器
│   │       ├── expr.c         # 表达式求值的实现
│   │       ├── sdb.c          # 简易调试器的命令处理
│   │       └── watchpoint.c   # 监视点的实现
│   ├── nemu-main.c            # 你知道的...
│   └── utils                  # 一些公共的功能
│       ├── log.c              # 日志文件相关
│       ├── rand.c
│       ├── state.c
│       └── timer.c
└── tools                      # 一些工具
    ├── fixdep                 # 依赖修复, 配合配置系统进行使用
    ├── gen-expr
    ├── kconfig                # 配置系统
    ├── kvm-diff
    ├── qemu-diff
    └── spike-diffz

Kconfig【kernel config】是一种配置系统，用于管理配置选项
自动处理配置选项的依赖关系；简化kernel的配置过程；最终自动生成配置文件和宏定义
本项目使用make menuconfig来配置nemu，比如选择的ISA等

## 实现x86的寄存器结构体: 改为用结构体实现eax-ax-al/ah的内存相同的效果
匿名union: union的所有成员共享一段内存
普通union作为子成员可以通过名字访问: cpu.gpr[0]._16
typedef struct {
  union {
    uint32_t _32;
    uint16_t _16;
    uint8_t  _8[2];
  } gpr[8];
} CPU_state;

匿名union的内容变为外层结构体的成员，可以直接访问: cpu._32
匿名结构体 / 匿名联合体成员提升（member promotion）：C11加入的特性

nemu从/nemu/src/nemu-main.c开始
init_monitor->engine_start->sdb_mainloop[等待输入命令]
逐个比较输入命令和cmd_table->cmd_handler调用exec函数
exec记录信息后调用execute_once->isa_execute_once

**RTFSC不只是盯着代码看，而是用gdb运行一边观察pipeline**

## 实现q退出不报错：
参考cmd_c在return前state改为2, 在cmd_q中的return前设置nemu_stata.state=NEMU_END

# 2025年10月19日

## 实现简易调试器
功能包括：help\continue\quit\step\info\scan-mem\breakpoint

qemu的启动顺序：
src/nemu-main.c/main() -> src/monitor/monitor.c/init_monitor() -> src/monitor/sdb/sdb-mainloop() -> 每次读取输入，匹配命令

make gdb调试执行

## 利用划分token的正则表达式对复杂表达式求值

词法分析：用REGEX按优先级匹配token【这一步由库函数处理】
递归求值：找到主运算符【优先级最低的运算符】

> 非运算符的token不是主运算符.
> 出现在一对括号中的token不是主运算符. 注意到这里不会出现有括号包围整个表达式的情况, 因为这种情况已经在check_parentheses()相应的if块中被处理了.
> 主运算符的优先级在表达式中是最低的. 这是因为主运算符是最后一步才进行的运算符.
> 当有多个运算符的优先级都是最低时, 根据结合性, 最后被结合的运算符才是主运算符. 一个例子是1 + 2 + 3, 它的主运算符应该是右边的+.

# 2025年10月25日

fopen是相对于当前工作目录的路径
计算出现两个问题：同优先级先计算右侧；解引用符识别错误

watchpoint: 每当读写某个变量，程序暂停

# 2025年11月1日

实现CPU的模拟器

exec_once: 保存信息到pc\snpc
- isa_exec_once: 执行指令并修改snpc
- 用更新的snpc赋值给dnpc

NEMU提供了更高层次的译码方式：模式匹配
INSTPAT_START();
INSTPAT("??????? ????? ????? ??? ????? 00101 11", auipc, U, R(rd) = s->pc + imm);
// ...
INSTPAT_END();

以上宏展开后：
{ const void * __instpat_end = &&__instpat_end_;
do {
  uint64_t key, mask, shift;
  pattern_decode("??????? ????? ????? ??? ????? 00101 11", 38, &key, &mask, &shift);
  if ((((uint64_t)s->isa.inst >> shift) & mask) == key) {
    {
      int rd = 0;
      word_t src1 = 0, src2 = 0, imm = 0;
      decode_operand(s, &rd, &src1, &src2, &imm, TYPE_U);
      R(rd) = s->pc + imm;
    }
    goto *(__instpat_end);
  }
} while (0);
// ...
__instpat_end_: ; }

其中，pattern_decode从指定的指令格式中读取opcode【key】，key的掩码mask，优化编译速度的shift【这里也使用了大量的宏】
> 9 // --- pattern matching mechanism ---
> 30 __attribute__((always_inline))
> 31 static inline void pattern_decode(const char *str, int len,
> 32     uint64_t *key, uint64_t *mask, uint64_t *shift) {
> 33   uint64_t __key = 0, __mask = 0, __shift = 0;
> 34 #define macro(i) \
> 35   if ((i) >= len) goto finish; \
> 36   else { \
> 37     char c = str[i]; \
> 38     if (c != ' ') { \
> 39       Assert(c == '0' || c == '1' || c == '?', \
> 40           "invalid character '%c' in pattern string", c); \
> 41       __key  = (__key  << 1) | (c == '1' ? 1 : 0); \
> 42       __mask = (__mask << 1) | (c == '?' ? 0 : 1); \
> 43       __shift = (c == '?' ? __shift + 1 : 0); \
> 44     } \
> 45   }
> 46 
> 47 #define macro2(i)  macro(i);   macro((i) + 1)
> 48 #define macro4(i)  macro2(i);  macro2((i) + 2)
> 49 #define macro8(i)  macro4(i);  macro4((i) + 4)
> 50 #define macro16(i) macro8(i);  macro8((i) + 8)
> 51 #define macro32(i) macro16(i); macro16((i) + 16)
> 52 #define macro64(i) macro32(i); macro32((i) + 32)
> 53   macro64(0);
> 54   panic("pattern too long");
> 55 #undef macro
> 56 finish:
> 57   *key = __key >> __shift;
> 58   *mask = __mask >> __shift;
> 59   *shift = __shift;
> 60 }
> 61 

在程序分析领域中, 静态指令是指程序代码中的指令, 动态指令是指程序运行过程中的指令. 例如对于以下指令序列

> 100: jmp 102
> 101: add
> 102: xor

jmp指令的下一条静态指令是add指令, 而下一条动态指令则是xor指令.
二者在顺序执行相同，在跳转执行时不同,所以需要execute_once更新

# 2025年11月11日

8 #define SEXT(x, len) ({ struct { int64_t n : len; } __x = { .n = x }; (uint64_t)__x.n; })        
涉及：位域【只能在struct或union内部定义，int b:4，指定占用的bits数】，成员初始化【.n=x而非赋值n=x】,位域的符号扩展【初始化时，对x作长度位len的截断，然后按截断后的最高位作符号扩展；在访问n时作符号扩展【因为声明是int64】，然后再转为uint64【这里只是改变类型，值不变】】
这里需要实现若干条riscv32的isa指令，才能运行程序；nemu会把程序直接加载到内存，按c执行
vim nemu/src/isa/riscv32/inst.c 找到decoder_exec加入新的decode字符串；这里从exec_once 开始，then isa_exec_once[see below line 80], call decode_exec(); these INSTPAT line try to match the input line with specific instructions[isa defined], then call decode_operand(), which read out rs1,rs2,imm and copy the last arg in INSTPAT as execution command

运行时环境: 为了同一份程序在不同架构(isa-平台【后者会提供额外的指令】)上运行，需要把不同架构的某些指令抽象为api，这就是库文件
抽象计算机：为了实现操作系统在不同架构上的运行，把OS需要的功能抽象为一组api，让各个架构分别实现它；这组API称为抽象计算机AM【abstract machine】
作为一个向程序提供运行时环境的库, AM根据程序的需求把库划分成以下模块
AM = TRM + IOE + CTE + VME + MPE

> TRM(Turing Machine) - 图灵机, 最简单的运行时环境, 为程序提供基本的计算能力
> IOE(I/O Extension) - 输入输出扩展, 为程序提供输出输入的能力
> CTE(Context Extension) - 上下文扩展, 为程序提供上下文管理的能力
> VME(Virtual Memory Extension) - 虚存扩展, 为程序提供虚存管理的能力
> MPE(Multi-Processor Extension) - 多处理器扩展, 为程序提供多处理器通信的能力 (MPE超出了ICS课程的范围, 在PA中不会涉及)

# 2026年1月20日

make文件的执行过程：
![三个阶段：解析、生成依赖树、执行命令](image.png)

Kconfig是Linux提供的配置界面，可以生成配置文件.conf和宏定义autoconf.h;Kconfig源文件是一个文本文件，定义选项可以实现多级依赖，选项支持不同数据结构【反映为宏的数值】

运行时机器的层次结构：注意区分“语言层次”和“结构层次”
![TRM的各个功能](image-1.png)
![TRM、IOE等功能在不同实现层次的体现](image-2.png)
运行时环境向上提供跨架构的统一api,例如作为c的stdlib【运行时环境分为和架构相关的AM，和与架构无关的常用库函数klib】；可以把linux的OpenSBI【Supervisor Binary Interface】、视为一种不完全的AM【不能完全不用ISA】，建立在ISA上；POSIX则给出了系统调用的行为和名称约定、c标准库的实现约定、shell语法和工具程序行为
实际上“程序”和“运行时幻境”都建立在isa上，最后都会翻译为isa；运行时环境只是包装isa实现常用的特定功能，供“程序”使用从而最后这两层一同编译连接为.exe/.elf
在isa与runtime-env之间常常是高级语言同机器语言的分野

# 2026年2月2日

itrace、mtrace、ftrace的实现

一个 ELF 文件从“用途”角度，分成三层信息：
ELF Header        —— 文件整体元信息
Program Headers   —— 给“加载器”看的（如何放进内存）
Section Headers   —— 给“链接器 / 调试器”看的

ELF Header的以下表项给出program-header列表和section-header列表的起始偏移量，e_phentsize和e_shentsize指定每一项的长度，这样就可以访问每一个header在elf中的位置
ElfN_Off      e_phoff;
ElfN_Off      e_shoff;
其中每一个Section header对应riscv64-linux-gnu-readelf -a add-riscv64-nemu.elf的一个section【如.text、.rodata】;每个program header对应一个load

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  RISCV_ATTRIBUT 0x00000000000012b3 0x0000000000000000 0x0000000000000000
                 0x000000000000002e 0x0000000000000000  R      0x1
  LOAD           0x0000000000001000 0x0000000080000000 0x0000000080000000
                 0x0000000000000168 0x0000000000000168  R E    0x1000
  LOAD           0x0000000000001168 0x0000000080000168 0x0000000080000168
                 0x0000000000000120 0x0000000000000120  RW     0x1000

Section 的 offset 是该 section 在 ELF 磁盘文件中的位置，section指出ELF文件整体包括哪些部分；Program Header指出如何把ELF文件的各部分放到进程图像的虚拟地址【指明ELF-offset和Program virtual address】;符号表描述在链接部分需要的符号，包括section名、函数名【和它对应的进程虚拟地址】、文件名等；【实际上符号表中Name 属性存放的是字符串在字符串表【section中的strtab，ascii字符间用00分隔】中的偏移量】【.shstrtab是section header string table】
注意不是所有字符串都存储在strtab，程序内的字符串常量存储在.rodata段
将elf的描述信息丢弃，通过objcopy -O binary得到.bin文件，是elf的执行img可以直接memcpy到pmem，是把elf的所有 PT_LOAD 段的内容“紧密拼接”到bin文件里

如何通过带参数的make运行？“make ARCH=riscv32-nemu ALL=recursion run“in nemu/tests/cput_tests为例[makefile执行顺序：解析参数-读取makefile-构建依赖图-执行依赖任务]
其中ARCH和ALL是变量，run是target；从上到下运行Makefile【但解析参数时如果有记录优先级更高，所以makefile中的定义不会被记录】；ALL总是存在定义的【要么参数要么Makefile内】，故总能触发依赖任务

# 2026年2月4日

一般-或--表示可选参数，POSIX定义的getopt完成解析参数的作用，对于一个传入的argv、argc维护optind和nextchar表示当前扫描进度；每次调用返回选项字母，有参数的在optarg中返回参数
用typedef MUXDEF(CONFIG_ISA64, Elf64_Off, Elf32_Off)    ElfN_Off;方式统一64/32位定义

ELF查找symtab符号表过程：ELF_header->e_shstrndx本文件的section名所在的section的section_header的编号->shstrtab[sections名称构成的区域；各section的section-name存储的是这个string-tab中的偏移量]->遍历找”.symtab“是第几个名称【不妨设为idx】->找ELF_header->e_shoff+idx*e_shentsize找到.symtab的header->符号表的header的sh_link指向关联的字符串section的header的索引->取这个strtab-header
sym->st_name是字符的偏移，直接str_tab+sym->st_name即可；符号表节（SHT_SYMTAB）的section的属性sh_link = 关联的字符串表节的索引

# 2026年2月5日

riscv32识别函数调用更复杂，因为没有call和ret指令，而是用“普通跳转 + 约定”来模拟函数调用
Makefile的伪目标始终需要执行，文件目标检查文件依赖是否比文件目标更加新，如果是则执行命令语句

本项目的参数传入分散在各个makefile中，且总是从abstract-machine目录下的makefile开始；其中进入nemu-main.c的argc和argv在include $(AM_HOME)/scripts/platform/nemu.mk中有log和batch，尽量在这个mk中修改；在nemu/script/native.mk中有ARGS_DIFF和arg_log
这些参数会在abstract-machine/scripts/platfrom/nemu.mk的insert-arg中插入编译的bin文件中的MAINARGS_PLACEHOLDER位置

可执行文件elf丢弃符号表strip可以执行，如果gcc -c得到的目标文件strip -s去掉符号表则无法通过链接gcc -l，报错如下：
(base) gingko@gingko-MRGF-XX:~/Documents/Temp$ gcc -o hello hello.o
/usr/bin/ld: error in hello.o(.eh_frame); no .eh_frame_hdr table will be created
/usr/bin/ld: /usr/lib/gcc/x86_64-linux-gnu/11/../../../x86_64-linux-gnu/Scrt1.o: in function `_start':
(.text+0x1b): undefined reference to `main'
collect2: error: ld returned 1 exit status

> itrace统计分支指令的跳转方向，用于分支预测器；ftrace同济函数调用次数，优化频繁调用的函数；mtrace得到访存序列，优化缓存的预取和替换算法
> trace对性能优化来说如此重要, 是因为trace反映了程序运行的真实行为, 如果你拍脑袋优化了程序中一个只会调用1次的函数, 可以想象这样的优化对程序总体性能几乎没有任何提升. 而trace其实向我们展示了程序运行过程中的细节事件, 如果我们对这些事件进行统计意义上的分析, 我们就可以知道哪些事件才是频繁发生的, 而优化这些频繁发生的事件, 才能从统计意义上提升程序和系统的性能, 这才是性能优化的科学方法.

# 2026年2月6日

Tail Call Optimization (TCO):当函数调用在funcA的return中出现时，GCC编译器优化汇编结果，把原本call X;ret变成jr X,减少一次栈帧形成，相当于直接把X代码放到本函数中，ret从X直接返回到A的上层；由于ret识别看当前地址判断所在函数，而当前地址在X中，所以呈现出call f1与ret f0对应

0x8000016c:                       call [f2@0x800000a4]
0x800000e8:                         call [f1@0x8000005c]
0x80000058:                         ret  [f0]              # 注释(2)
0x800000fc:                       ret  [f2]                # 注释(1)

最经典的 archive 工具就是ar，它做的事情非常朴素：把多个目标文件（.o）打包成一个文件;gcc使用archive参数指定ELF使用的静态链接库

PA建议的测试库函数顺序：设计测试程序在native-glibc【检查测试程序是否存在问题】，native-klib【检查自己写的库函数实现是否有问题】，nemu-klib上运行【检查自己写的库函数实现是否有问题】；native用GNU/Linux默认的运行时环境来实现的AM API，默认链接到glibc, 我们需要把这些库函数的调用链接到我们编写的klib来进行测试
可以通过在abstract-machine/klib/include/klib.h 中通过定义宏__NATIVE_USE_KLIB__来把库函数链接到klib. 如果不定义这个宏, 库函数将会链接到glibc, 可以作为正确的参考实现来进行对比

如何在make中使用if？子make语句有返回值，当命令失败时返回非0:
@if make -s -f $@ ARCH=$(ARCH) $(MAKECMDGOALS); then \ fi

如何测试指令实现的正确性？考虑assert不太能描述单个指令的行为后果，提出可以用真机和nemu的运行状态对比查出错误【这种测试方法被称为Differential testing】

通常来说, 进行DiffTest需要提供一个和DUT(Design Under Test, 测试对象)【这里测试对象是nemu中isa的实现】 功能相同但实现方式不同的REF(Reference, 参考实现)【由于真机不一定与DUT使用相同isa，故这里常用其他系统模拟器】, 然后让它们接受相同的有定义的输入, 观测它们的行为是否相同；第一次发现NEMU的状态与真机不一样的时候, 就是因为当前执行的指令实现有误导致的. 

nemu对不同的isa选择不同的ref：x86使用KVM，mips32用qemu，riscv32用Spike；比较dut和ref的reg和内存状态，可以快速发现Error【事实上, 获取REF中指令修改的内存位置并不是一件容易的事情, 而对比整个内存又会带来很大的开销，Nemu没有实现比较内存】

由于DiffTest需要与REF进行通信并让REF执行指令, 还是会降低NEMU的运行速度. 因此除非是在进行调试, 否则不建议打开DiffTest的功能来运行NEMU
RISC-V作为一个RISC架构, 通常不支持不对齐访存，在Spike中执行一条地址不对齐的访存指令将会抛出异常, 让PC跳转到0

NEMU是一个用来执行其它程序的程序. 在可计算理论中, 这种程序有一个专门的名词, 叫通用程序(Universal Program), 它的通俗含义是: 其它程序能做的事情, 它也能做.
"Computability, complexity, and languages: fundamentals of theoretical computer science" 一书中提出了一种仅有三种指令的程序设计语言L语言, 并且证明了L语言和其它所有编程语言的计算能力等价. 