# 2025年10月9日

## Chap2: OS Intro

为什么需要kernel和user-mode: 隔离各进程，为进程提供服务
mono内核，OS全部在kernel中；micro kernel将OS实现为若干进程，kernel仅作为进程通讯的功能

Isolation: between applications/between apps and os
使用操作系统的一个原因，甚至可以说是主要原因就是为了实现multiplexing和内存隔离

Defensive: 处理恶意程序
supervisor-mode和虚拟内存，前者下可以运行特权指令【直接操纵硬件的指令】；实际上通过ecall触发中断【中断程序在内核中】从用户mode切换到kernel-mode

ECALL【enter call】接收一个数字参数，当一个用户程序想要将程序执行的控制权转移到内核，它只需要执行ECALL指令，并传入一个数字。这里的数字参数代表了应用程序想要调用的System Call。

kernel-mode 和kernel相互为对方的唯一用途
OS有若干模块，其中什么部分被认为是"kernel"，随设计模式不同而变化：宏内核认为kernel包括所有OS功能，微内核认为kernel只包括进程通信、IPC等基础功能；linux/unix下谈论的kernel是前者

trap程序把传入syscall的参数从寄存器提取到trap-frame；提供了若干从trap-frame提取参数的函数；如果参数是指针，需要从用户空间读取内容
trap配置CPU的方式依据中断发生的位置在kernel/userspace而不同: 写入寄存器【stvec决定trap跳转位置】的内容不同，切换页表不同
kernelvec.S汇编程序保存寄存器；kerneltrap处理interrupt和exception
如果从userspace进入，在切换到内核态之前，需要禁用中断

进行syscall的过程：
系统调用write->usys.S[SYS_write写入a7],ecall->trampoline.S的uservec[保存用户寄存器到trapframe]->trap.c的usertrap()[判断是否是syscall导致的陷入]->syscall.c的syscall()[调用真正的syscall函数]->usertrapret[从trapframe恢复寄存器]->trampoline.S的userret返回原位置

## Lab2: Syscall implement

user.h、usys.pl、kernel/syscall.h加入syscall函数原型声明
kernel/sysproc.c实现syscall

kmem的维护比较简单，在kalloc中包括初始化，分配和释放
kmem->freelist是一个run指针组成的链表【run只包含一个run指针】

进程表proc的处理在proc.c中，本项目实现为进程池
包括为进程初始化【分配\释放内核页】【分配\释放用户页】，获取\释放进程

# 2025年10月13日

# Chap3: Page table

Sv39 RISC-V下，虚拟地址只使用低39位，其中27位是虚页号；物理地址56位，其中高44位是实页号
PageTable是2^27个PTE组成的数组，每个PageTableEntry包含一个44bits实页号，虚页号作为顺序的index不用存储，还包括若干flags
一个PTE占用64bits，有10bits用于reserved，10bits flag，44bits PPN[Physical Page Number]

![27=3*9位虚拟地址的三级页表](<Screenshot from 2025-10-13 10-35-10.png>)
三级页表的好处，是可以对其中不用到的page不分配，从而省下大量空间；
三级页表中如何进行page-directory到page-directory的查找，因为PTE只提供页号？用0填充余下的12位来实现56bits的物理地址
Guard page实际上不映射到真实物理地址，vaild位=0；用于防止越位溢出

根页表的地址在satp寄存器中，每个CPU有一个satp寄存器；
每个进程对应一个页表，通过每个进程对应一个 satp 值实现

CPU用他的satp指向的页表翻译instruction的地址

内核页表：
![进程维护的内核虚拟地址页表: 部分内容直接映射到物理内存](image.png)
为什么需要guard-page：guard-page不映射到物理内存，用于隔离各kernel-stack
kernel stack和trampoline都是不只进行直接映射，还作为虚空间的top位置地址

boost时，kvminit分配一个物理页作为kernel页表的root页，kvmmap建立整个页表【walk遍历虚页表并分配页:将每一个I/O设备映射到内核】;kvminit使用kvmmap建立若干页，包括建立内核栈

main函数中，kvminithart把kernel页表的root页写入satp，包括使用sfence.vma清除TLB中的PTE缓存，procinit为每个进程分配[注意是分配已有的而非创造内核栈]内核栈【xv6中统一为进程池所有进程分配内核栈】即写pa入pte，再次调用kvminithart重写入satp【目的是刷新TLB，实际上使用sfence.vma】

物理页分配：维护一个空页集合，空页由run指针表示，run指针存储在空页中，从而不需要额外的空间维护空页链表
main中，调用kinit初始化空链表，逐页调用kfree来设置初始值和设置run指针【本页的前若干字节设置为run】，并连接到空链表头上

进程的页表：每个进程有一个页表，切换进程会切换页表
进程过程：exec->_start->进程的main
exec加载文件、传入调用main的参数，进入_start汇编文件
_start读取参数，调用main并传入参数
main结束后，由于没有上层调用main的函数[是_start调用]，没有ra，所以在exec中把用户栈中设置一个fake return address[0xFFFFFFFF],这是一个非法地址，会导致exit结束程序

老版本的xv6将kernel 映射到用户态中（不可写），但会导致在加载ELF文件【此时是kernel权限，可写内核映射】时，由于恶意设置段加载地址【导致溢出】，导致写入的ELF覆盖低地址的内核文件

> kernel的addr-space中包括一段free memory，XV6使用这段free memory来存放用户进程的page table，text和data。如果我们运行了非常多的用户进程，某个时间点我们会耗尽这段内存，这个时候fork或者exec会返回错误。

# 2025年10月16日

cpu有若干缓存Cache，有些缓存根据虚拟地址，有些缓存基于物理地址；每次更新页表后需要刷新根据虚拟地址的那部分TLB

syscall exec可以加载一个可执行文件到本进程，然后运行新进程而不运行原有进程后续语句
exec:用可执行文件ELF初始化一块用户内存空间，elfheader包括若干programheader，后者描述若干段【load段、stack段等】；
首先检查ELF魔数，然后分配新页表，创建新页和loadseg
接着将传入参数放在stack顶端，然后释放原进程，从新进程入口开始执行

为什么需要walk:因为exec要加载ELF到各个页

# 2025年10月22日

## Lab3: Pagetable

物理地址到设备的对应由硬件设计决定;
上电后，运行boot ROM[0x1000]代码；完成后跳转到0x80000000

操作系统中维护一个全局变量存储kernel页表的root页,存储在内核bss段
kernel-page-table中包括用户进程的text\data\pagetable; 用户页表中也包括他的text\data；这是因为在xv6中kernel-pagetable包括ram全体的恒等映射，由于希望在内核态访问进程数据，得到用户的数据物理地址后可以直接访问【即使在内核台的映射规则下】

main函数在scheduler前运行userinit，userinit【是一种glue code】创建了一个用户进程，写入了initcode；initcode包括三条指令，包括syscall_exec，之后ecall；ecall进入syscall函数后根据传入参数选择调用syscall_exec函数，这里传入exec的参数是init，即执行init.c程序；init.c程序中配置console,fork子进程用于通过exec执行sh.c【shell】程序，主进程死循环等到shell推出后结束；sh.c循环等待输入指令，得到正确指令后运行【注意cd指令不同，不是依靠外部文件，因为要改变自己shell进程的状态】

kinit对物理内存初始化，包括设置初始值，把所有ram加入空页表list中；
kvminit中分配一页作为kernel页表的root，并把kernel-page的所有内容通过walk映射到kernel的虚拟页表中,分配进程的内核栈,最后把root页存储到kernel_pagetable全局变量
kvminithart将kernel_pagetable存入satp寄存器并清空TLB，从此开始使用虚拟地址

hart可以理解为cpu核心，一个hart对应一个核心
注意mappages中不用分配实际存储页【看walk发现至多kalloc两次，这两次都是page-directory】，因为实际存储页总是提前存在的【kernel的页被boot加载；user被loadseg加载】

# 2025年10月23日

系统启动boot的过程：
boot【load kernel到0x800000,只做这件事】->_entry.S【声明初始栈】->start.c[machine mode]基本为退回main作准备->main.c【这里main先调用userinit初始化进程，再启动cpu loop：scheduler函数，不断检查是否有可运行的进程，如果有则切换p->state=running,并保存现有寄存器，切换所有寄存器内容，通过ret到新的ra更换进程】->调用userinit()生成的进程，其中exec第一个用户进程initcode.S【唯一的任务是启动/init】->initcode.S中exec /init程序->打开控制台设备，运行shell

userinit也通过allocproc创建进程，fork也是；
目录页只设置PTE_V

# 2025年10月27日

## Chap4: Trap
long和指针的长度与寄存器大小相同；char和unsigned char都是无符号
RISC—V至多通过寄存器传入8整数8浮点到函数，部分浮点也可以传入整数寄存器；若有其他参数通过栈传递
对于两倍指针字长度的参数，如果通过寄存器传递，对其到偶-奇寄存器【而不能奇-偶】

> 小于指针字长度的，放在低位
> 对于两倍指针字长度的参数: 例如，在 RV32 中，函数 void foo(int, long long) 的第一个参数传递到 a0，第二个参数传递到 a2 和 a3，a1 不传递任何值。
> 大于两倍指针字的参数通过引用（by reference）传递。

关于返回值，要么通过a0、a1整数寄存器和fa0,fa1浮点寄存器，要么分配一个内存指针到整数寄存器，指向大的结构体返回值在内存中的地址

> 关于临时寄存器和不变的寄存器
> 除了参数和返回值寄存器外，七个整数寄存器 t0–t6 和十二个浮点寄存器 ft0–ft11 是临时寄存器（volatile），调用过程会改变它们，调用方如果后续还用到必须保存。十二个整数寄存器 s0–s11 和十二个浮点寄存器 fs0–fs11 会在调用过程中保持不变，调用方使用时由被调用者保存。

> 汇编文件中，global表示你可以在其他文件中调用这个函数。text表明这里的是代码。

![函数栈](image-1.png)
fp是栈的基地址
函数栈存储至少三项内容，ra\last fp\saved reg,前二者在固定位置；此外还有局部变量、传入参数【当寄存器不够使用时通过栈传入】
call命令会自动存储ra，所以在使用call的函数内，需要提前存储ra以防止被call存储的ra覆盖；这也是为什么leaf函数不需要存储ra：ra已经在call它时存入ra寄存器了，只需要ret就可以jal

Traps的处理
包括四阶段：硬件部分的中断向量、C code trap处理器, syscall routine或设备驱动routine

硬件原理：
stvec: 存储中断向量handler的地址【uservec】
sepc: 中断的恢复地址
scause: 中断发生的原因
sscratch: 用于存储指向trapframe的指针，trapframe【每个进程对应一个trapframe】用于存储中断程序的寄存器
sstatus: 决定是否屏蔽设备中断信号

> 1. If the trap is a device interrupt, and the sstatus SIE bit is clear, don’t do any of the following.
> 2. Disable interrupts by clearing SIE.
> 3. Copy the pc to sepc.
> 4. Save the current mode (user or supervisor) in the SPP bit in sstatus.
> 5. Set scause to reflect the trap’s cause.
> 6. Set the mode to supervisor.
> 7. Copy stvec to the pc.
> 8. Start executing at the new pc.

从用户中断：

RISC—V中，CPU 在陷阱（trap）发生时不会**自动**切换到内核页表、不会切换到内核栈，也不会保存除程序计数器（pc）以外的任何寄存器。这些工作都必须由内核软件来完成，从而运行trap-vector对应中断处理程序

uservec是一段代码，用来切换satp到内核态，并存储当前寄存器内容到trapframe中；为了保证能在切换前后继续运行本段代码，跳板页trampoline在内核页和用户页的虚拟地址相同，所以可以用相同的虚拟地址访问

在uservec中，switch sscratch【trap前设置为本进程的trapframe】 with a0,从而可以通过a0存储其他寄存器；注意trapframe和trapoline在用户空间相邻，但是trampoline在内核除了直接映射，还有映射到最高地址，**kernel只有一个trampoline**
可见是先通过没改变的satp存寄存器入本进程的trapframe，然后切换satp到内核态；由于进程PCB中记录的是trapframe的物理地址，所以可以在内核态访问进程的trapframe;存储后，call usertrap

usertrap判断trap的原因，运行处理程序；
1. 更改中断向量，此时如果再遇到中断，应该由kernelvec处理而非uservec
2. 保存sepc: 作为对外不变的寄存器，要先存储到tramframe，防止后续被覆盖
3. 按trap类型处理
usertrapret和userret与上述类似，不过操作相反

从内核中断：每个进程对应一个内核栈
内核中断只包括设备中断和异常，前者调用devintr，后者直接panic停止运行

exception处理: 如何利用pagefault整活：
CopyOnWrite fork实现parent/child共享物理页而不发生冲突：一开始所有内容都是Readonly，当尝试写入触发pagefault，此时复制本页并和原页分别分配给父子进程，并分别允许读写，更新各自pte
这样避免了大量复制父进程页，节省内存
Lazy Allocation：sbrk先扩展地址空间但并不分配物理页，而是设置标记位vaild=false;仅当需要用到却发现vaild不可用报错pagefault时，才实际分配物理页[与传统三级页表的区别是，三级页表中sbrk申请扩充时会真的申请新的物理页，但lazy allocation不会]
paging from disk: 当需要的内存多于RAM，把页放入Disk，并在对应页表中标记vaild=false;查询到vaild=false，查看是否在disk上，如果在则替换回来

# 2025年11月3日

## Lec6: Trap

Trap指的是从user切换到kernel，对用户透明【出于安全性考虑，不能使用user的寄存器内容】；硬件维护一个表明当前mode的标志位，这个标志位表明了当前是supervisor mode还是user mode；superior-mode下，允许读写控制寄存器，访问vaild=0的pte

syscall过程: 
用户调用user.h中的函数[此时gcc遵守riscv convention将参数写入a0开始的若干寄存器中]，执行usys.pl生成的assembly stub[写入syscall索引然后ecall]，->ecall->trapoline跳板页的uservec.S->usertrap.c【内核代码】->syscall()->sys_writes()->
返回syscall()->usertrapret()->userret.S->返回用户空间

关于read/write系统调用和memory-mappe-file-access
前者需要切换mode实现读写文件；后者只需要访问页表，以读写内存的方式读写文件

为什么uservec.S要交换a0和ssratch?
在进入supervisor-mode前；sscratch指向进程唯一的trapframe，所以需要交换从而允许访问
trapframe中包含若干内核提前写入的内容，比如kernel_satp

ecall工作内容：内核提前设置stvec寄存器内容为trampoline
usermode->supervisor-mode；保存PC到SEPC；从stvec加载地址到PC
由于ecall是一个riscv的ISA指令，所以实际上不会看到具体执行代码

stvec指向trapoline页，本页的开始部分是uservec函数；uservec除了保存若干用户寄存器，还从trapframe中读取内容初始化内核运行状态【内核栈sp，内核页表satp】，并准备跳转到usertrap

> 有很多原因都可以让程序运行进入到usertrap函数中来，比如系统调用，运算时除以0，使用了一个未被映射的虚拟地址，或者是设备中断。usertrap某种程度上存储并恢复硬件状态，但是它也需要检查触发trap的原因，以确定相应的处理方式，我们在接下来执行usertrap的过程中会同时看到这两个行为。

usertrap：
写kernelvec入stvec寄存器；查找当前进程；保存全局sepc到本进程的trapframe中；从scause寄存器中读取trap原因【ecall/dev-problem/interrupt】
开中断【之前处理相应中断，从user进入内核时关中断；之后已经进入内核正常运行代码，应该打开中断】；syscall

syscall调用对应的函数，并保存返回值到trampoline的a0位置

usertrapret:
关中断，恢复stvec为trapoline内容；填入kernel信息和当前进程信息到trapframe；通过函数调用的方式转到userret并传入参数trapframe【a0】，用户页表satp【a1】
trampoline:
userret恢复寄存器，恢复页表；sret开中断；切换会user-mode

> 用户寄存器（User Registers）必须在汇编代码中保存，因为任何需要经过编译器的语言，例如C语言，都不能修改任何用户寄存器；所以往往在c中获取值，然后在汇编中赋值给具体寄存器

## Lab: trap
为了实现call一个32位地址【指令不能直接包括32位地址】，用auipc决定高20位，用jalr rd offset(rs) [存储当前地址到rd，跳转到rs+offset]， 这里rs常常是ps，offset是低12位

实现backtrace：每个stackframe中包括一个指向caller的frame的指针
gcc编译.s文件，会把caller-frame栈帧指针存储在s0；可以在c文件中加入asm volatile("mv %0, s0" : "=r" (x) );来执行内联汇编语句

> Note that the return address lives at a fixed offset (-8) from the frame pointer of a stackframe, and that the saved frame pointer lives at fixed offset (-16) from the frame pointer. 

gcc的convention:
![ra-fp-saved-local](image-2.png)

每个kernelstack在xv6中就只有一页，所以检查越界只用看是否超出这一页[PGROUNDUP/DOWN]
user/usys.pl 给出user的带参数的调用结构,到ecall的过程; 此时的a0\a1\a2寄存器已经是传入参数
进程锁是为了防止若干核心同时访问一个进程时，造成状态的不一致；不是所有的进程状态都需要进程锁保护
不能在kernel虚拟页表下直接执行alarm_handler[一个用户传来的函数]，一方面安全性考虑，一方面页表不同
过程：在中断时改epc为handler的地址，然后正常通过usertrapret和userret返回；handler中必须包括sigreturn以恢复中断前的数据

要注意防止handler重入：上一个handler还没有sigreturn，下一个不应该开始
注意先保存trapframe，再更换epc

# 2025年11月13日

## Lec: page fault
lazy allocation, COW, demand padging, memory mapped files

内核存储 出错的地址STVAL、出错的原因SCAUSE、出错时的pc值【虚拟地址？】

lazy allocation：只改变p->sz【stack和heap的交界的虚拟地址】，不实际分配内存；当出现访问p->sz下，stack【因为stack位置不变，这里通过检查页表的状态位实现】上的内容，再分配内存；
这是为了防止分配过多空间
Zero fill on demand：大量全局变量存储在bss，初始值为0；先全部指向一页，需要时再allocate新页；采取的原因和lazy-allocation相同
CoW:子进程从父进程复制后，经常exec再次分配内存load，实际上不用第一次复制
提出fork子进程时不复制，而是都映射到父进程的内存，设置Readonly；当需要写入时，分配新页给子进程，并分别置可读写；要标记这是一个CoW页，而非写入真正只读页；注意父进程推出时要检查，是否只有自己在使用这个内存，通过对物理page的引用计数实现
Demand paging：加载ELF时页不一定要立刻把所有内容从磁盘到内存，因为加载大量内容也耗时；这里只是建立页表，设置标志位为on-demand page;page-fault时读取page数据，加载到内存，更新页表
memory mapped files：通过load、store来操作文件
mmap(va,len,protect,flag,fd,off)：从文件描述符对应的文件的偏移量的位置开始，映射长度为len的内容到虚拟内存地址VA，同时我们需要加上一些保护，比如只读或者读写。
这里的实现也是lazy的，在需要修改时再写入文件内容
unmap(va,len)：写回文件

## Lec: Interuption 硬件中断

top可以查看内存使用情况
MiB Mem :  15715.2 total,   9009.7 free,   2874.9 used,   3830.6 buff/cache

> 大部分操作系统运行时几乎没有任何空闲的内存,因为用于cache/buff。这意味着，如果应用程序或者内核需要使用新的内存，那么我们需要丢弃一些已有的内容。当内核在分配内存的时候，通常都不是一个低成本的操作，因为并不总是有足够的可用内存，为了分配内存需要先撤回一些内存。

> 如果你查看输出的每一行，VIRT表示的是虚拟内存地址空间的大小，RES是实际使用的内存数量。从这里可以看出，实际使用的内存数量远小于地址空间的大小。

![中断-PLIC平台级别中断控制-CPU核](image-3.png)

- 这里的具体流程是：
- PLIC会通知当前有一个待处理的中断
- 其中一个CPU核会Claim接收中断，这样PLIC就不会把中断发给其他的CPU处理
- CPU核处理完中断之后，CPU会通知PLIC【CLINT管理软件中断和时中中断，PLIC管理硬件中断】
- PLIC将不再保存中断的信息

中断处理的软件部分
管理设备的代码称为驱动，所有的驱动都在内核中。我们今天要看的是UART设备的驱动，代码在uart.c文件中。如果我们查看代码的结构，我们可以发现大部分驱动都分为两个部分，bottom/top；前者是一个interupt handler，后者是向进程提供的接口

interupt handler 并没有运行在任何进程的context中，所以进程不能直接交互interupt-handler因为不知道读写地址；

> load/store指令实际上的工作就是读写设备的控制寄存器。例如，对网卡执行store指令时，CPU会修改网卡的某个控制寄存器，进而导致网卡发送一个packet。

> 举例：我们通过load将数据写入到这个寄存器中，之后UART芯片会通过串口线将这个Byte送出。当完成了发送，UART会生成一个中断给内核，这个时候才能再次写入下一个数据。

读取【键盘】时，进程调用syscall_read()来读一整行输入进程；read进入consoleread，当没有读取到整行，consoleread会sleep；
每当用户键入字母，uart接受到字节发出中断，通过trap-handler进入uartintr，读取字符并交给consoleintr，consoleintr将输入字符累积到cons.buf并处理特殊字符,也把字符交给uartputc来打印字符【回显】，遇到换行符唤醒consoleread；consoleread发现输入整行，取走到用户空间[拷贝到用户页表范围]并返回给用户进程

有两种情况调用uartstart【把buf中的字符交给uart硬件发送】：uartputc()新数据写入、uartintr()当uart发送完毕触发中断
写入uart【显示到屏幕】时，总是写入到buf然后启动uartstart尝试传输，这样不等待uart真实发送就返回，实现进程与设备的解耦；写完一个字符return等待发送完毕触发intr再调用uartputc发送一个字符

这里所谓的写入接受，都是在地址空间中的 本设备映射地址读取和写入，实际写入读取硬件的特定寄存器

# 2025年11月14日

中断不能假设 当前运行的进程就是正在等待中断的进程，所以不能依赖当前进程的页表和状态；所以用户态下的中断处理程序做简单的操作，这里只是把uart输入字符放入内核，发信号；进入内核态进行详细操作

在数据传输方面，有程序化IO【驱动从设备寄存器逐字节读取数据】、dma【设备直接写入ram，驱动告知进程是否准备好】两种方式
对于如何唤醒IO数据处理进程，有poll轮询【每间隔一段时间查询是否有设备处理】、intr中断【有数据需要处理时发出intr】；前者适用于io频率较高的设备，后者适用io频率不高且时间不可预侧的设备；有驱动支持再poll和intr间切换

> UART 驱动程序先将输入数据复制到内核缓冲区，再传输至用户空间。这种模式在低速数据传输时可行，但对于高速数据生成或处理的设备，双重拷贝会显著降低性能。有些操作系统支持直接从设备写入用户内存，通常通过DMA的方式

如何处理定时器中断？
历史原因，一开始的中断都是在machine-mode中处理；通过**中断委托**的方法可以再supervise-mode下处理；但是xv6没有把定时器中断加入中断委托，不通过trap机制处理；
由于machine-mode下没有分页机制，不好作处理操作；定时器中断唤起定时器中断处理【machine-mode】，只会唤起一个软件中断trap然后回到正常运行；此时看到有一个trap，再这个trap中处理本定时器中断应该导致的工作
定时器中断用于进程切换【抢占式调度每个进程最多运行若干clock之后切换进程】

> 全面支持典型计算机上的所有设备需要大量工作，因为设备种类繁多、功能复杂，且设备与驱动程序之间的通信协议可能晦涩难懂。在许多操作系统中，驱动程序的代码量甚至超过了核心内核。

# 2025年11月17日

三种导致指令交错的情况：
多cpu同时运行多进程；单cpu切换运行多线程；中断与正常运行的程序修改同一处数据；实际上，由于用户态代码相互隔绝，只有涉及内核的操作会导致指令交错，所以只需要考虑内核代码如何处理指令交错

> lock protects some collection of invariants that apply to the data. Invariants are properties of data structures that are maintained across operations.

invariance 理解为对数据结构进行操作时，需要在操作前后保证数据结构的值同定义时的语义相同
如果struct a中ptr指向链表的头，那么ptr在函数结束后仍然指向链表的头，允许再函数中间违反语义【例如暂时指向第二位】

理解锁的两种方式：视为串行进行，或视为原子操作；赋值也可能不是原子性的汇编操作：可能先赋值高32位，然后赋值低32位
只要会有多个进程访问的数据结构，都可以考虑用lock保护
注意是进程获得锁，所以其他进程无法获得锁

> 自旋锁与中断的交互会带来潜在危险,如果进程获得锁，但是触发中断，这个中断也需要这把锁，就会导致死锁；解决方法是，当拥有一把中断需要的锁时，禁止开中断
> xv6 采取的策略更保守：只要 CPU 获取任何一个锁，xv6 就会在该 CPU 上禁用中断。其它 CPU 上仍然可以发生中断，因此中断处理程序可以在其它 CPU 上等待线程释放锁；只是不能在同一个 CPU 上这样做；这样不会导致死锁，因为这个cpu可以继续执行，等他释放锁，另一个cpu上的中断也就可以获取锁，进而继续运行

# 2025年11月30日

lazy allocation：实际有页表，但没有具体的页，通过页表项PTE的状态位来实现lazy-allocation
COW：在传统fork中复制父进程内容，然而实际没有必要，cow-fork不复制，只在二者写同一页时真正复制，并改变子进程的pte指向新页

> COW fork() marks all the user PTEs in both parent and child as not writable. When either process tries to write one of these COW pages, the CPU will force a page fault. 

![PTE-flag](image-4.png)
![scause对应interupt](image-5.png)

> if(p->pagetable)
>   proc_freepagetable(p->pagetable, p->sz);
> p->pagetable = 0;
> if(p->trapframe)
>   kfree((void*)p->trapframe);
> p->trapframe = 0;
trampframe用户页表引用一次，内核引用一次；在取消用户页表引用时不许free；原顺序在没有取消用户页表引用时就kfree了，所以不行？ 

考虑所有从kalloc触发的分配页作引用计数太复杂【不一定都通过unmap】，考虑所有经过mappages的pages，这些页实际上才是COW的目标用户【其他页要么是目录，要么是booting时使用，要么时trampoline等特殊页】

xv6提供copyout等方法从kernel空间【实际上就是纯物理地址】向用户空间拷贝，需要提供页表和va

SIP中断挂起寄存器：显示哪些中断在等待处理	
SCAUSE原因寄存器：显示当前正在处理的中断/异常的原因

打开设备中断的流程：【console是一个外设【屏幕】,用open文件的形式打开并获取句柄】
初始化外设：关中断，设置，开中断；
初始化plic：接受哪些设备中断到PLIC
初始化CPU：接受哪些中断请求

主机输出到屏幕：printf-系统调用write-filewrite函数-根据fd类型【这里是dev了类型】调用write函数-consolewrite-uartputc写入字符到缓冲区，并尝试启动uartstart-uartstart检查是否传输完毕，如果传完上一个则把此次c写入寄存器THR【等待uart-bottom处理】；bottom发送完毕后引起中断，中断处理uart也会导致uartstart，从而持续发送缓冲区中的字符

uart实际是两根线：
keyboard===cons.buffer===>pc===uart_tx_buffer===>screen
左侧以中断触发写入buffer；sys_read读取
右侧以sys_write在获取锁【考虑关中断】的情况下写入THR；中断触发标志当前THR发送完成，可以发送队列中下一个字符

键盘输入到主机：每个字符导致一次中断usertrap-devintr【从PLIC获取中断类型】-uartintr-consoleintr 
consoleintr中写入c到cons.buf,并通过与write系统调用不同的方式conputc输出到console屏幕【conputc中使用uartputc_sync完成回显，uartputc_sync内禁止中断】；判断是否输入一行来决定唤醒consoleread,consoleread返回fileread返回read返回get返回getcmd

用conputc-uartputc_sync写入THR有可能导致写入覆盖！如果此时有write调用运行到uartstart,在写入THR的前一刻触发键盘输入中断，则会导致回显字节被覆盖

## Thread：单个串行执行代码的单元

实现解决多任务/单任务分拆加速/简化单任务等方法

>event-driven programming或者state machine，这些是在一台计算机上不使用线程但又能运行多个任务的技术。在所有的支持多任务的方法中，线程技术并不是非常有效的方法，但是线程通常是最方便，对程序员最友好的，并且可以用来支持大量不同任务的方法。

>定时器中断仍然能在例如每隔10ms的某个时间触发，并将程序运行的控制权从用户空间代码切换到内核中的中断处理程序（注，因为中断处理程序优先级更高）；xv6中，用户进程通过中断到到内核线程，这是抢占式调度，而进入内核后的内核线程间yield自愿调度，是voluntary-scheduling

线程状态：RUNNING、RUNABLE、SLEEPING等
前文通过定时器打断的线程从RUNNING变为RUNABLE；

当用户程序在运行时，实际上是用户进程中的一个用户线程在运行
切换用户进程的流程：用户进程a保存它的用户线程上下文到trapframe，使用它的内核线程context；内核线程a作若干准备，调用swtch函数切换到调度器线程【的context】，执行scheduler函数【设置进程a状态、找下一个RUNABLE进程b】；再次调用swtch【保存自己调度器线程的context，恢复b的内核线程context】；内核线程b继续执行，退回用户进程b【加载用户进程b的trapframe】并恢复执行

> XV6中，一个CPU上运行的内核线程可以直接切换到这个CPU对应的调度器线程；每一个调度器线程有自己的context对象，但是它却没有对应的进程和proc结构体，所以调度器线程的context对象保存在cpu结构体中。

> 应用进程的context可以保存在任何一个与进程一一对应的数据结构中，因为每一个进程都只有一个内核线程对应的一组寄存器。

进程分配资源空间，线程是使用这些资源空间的具体工作流【栈、寄存器上下文】；实际上同一时间【单核】只有一个线程【指令流/工作流在运行】

yield函数与swtch函数
yield取得proc锁后，修改进程状态为RUNABLE，调用sched(),调用swtch汇编文件
swtch保存内核线程context，加载cpu的调度器context【返回地址是scheduler函数】；通过ret指令跳转到ra指向的区域

>struct proc {
>struct spinlock lock;
>  // p->lock must be held when using these:
>  enum procstate state;        // Process state
>  void *chan;                  // If non-zero, sleeping on chan
>  int killed;                  // If non-zero, have been killed
>  int xstate;                  // Exit status to be returned to parent's wait
>  int pid;                     // Process ID
>  // wait_lock must be held when using this:
>  struct proc *parent;         // Parent process
>  // these are private to the process, so p->lock need not be held.
>  uint64 kstack;               // Virtual address of kernel stack
>  uint64 sz;                   // Size of process memory (bytes)
>  pagetable_t pagetable;       // User page table
>  struct trapframe *trapframe; // data page for trampoline.S
>  struct context context;      // swtch() here to run process
>  struct file *ofile[NOFILE];  // Open files
>  struct inode *cwd;           // Current directory
>  char name[16];               // Process name (debugging)
>};

考虑proc的具体实现：各proc实际实现为内核中proc数组，需要的进程占用数组中的元素；加锁是为了保证进程【所有运行的程序】修改本进程的 允许修改的状态时，不要并发；不加锁是因为这些属性只影响进程内部操作，外部进程不访问

> 为什么swtch函数要用汇编来实现，而不是C语言？
> C语言中很难与寄存器交互。可以肯定的是C语言中没有方法能更改sp、ra寄存器。所以在普通的C语言中很难完成寄存器的存储和加载，唯一的方法就是在C中嵌套汇编语言。

> swtch函数是线程切换的核心，有保存寄存器，加载寄存器的操作。线程除了寄存器以外的还有很多其他状态，它有变量，堆中的数据等等，但是所有的这些数据都在内存中，并且会保持不变。我们没有改变线程的任何栈或者堆数据。所以线程切换的过程中，处理器中的寄存器是唯一的不稳定状态，且需要保存并恢复。

# 2025年12月3日

## Chap-Scheduling

![Swtching process](image-6.png)
为什么需要保存Swtching-threading？因为Scheduler运行到swtch时保有遍历到的进程数据元素p，要保证返回后继续遍历
最重要的是ra和sp，标志会更改运行代码和使用的栈

yield在usertrap最后识别为时钟中断时启动，yield-shed-swtch切换为调度器线程
Swtch只保存callee-saved reg，因为caller-saved reg已经在用户的内核栈上保存,切换reg切换sp，改变使用的栈；swtch 运行到汇编ret，使用ra跳转到调度器线程 

注意第一个进程通过allocproc实现，其中初始化context的ra和sp为一个内核函数forkret和初始的栈；写好第一个进程后进入scheduler循环，找到刚刚用initcode初始化的进程，swtch到它的内核线程context，也即forkret；forkret初始化文件系统，并通过usertrapret返回；这个pid=1的进程运行initcode，exec(init)运行init程序，进入while死循环，fork一个子程序运行sh，父进程for死循环等待sh返回，如果正常返回跳出for死循环再次while循环fork子进程运行sh

注意xv6采用较强的持锁禁用中断机制：持有任意锁禁止所有中断，从而保证中断不因为尝试获取锁陷入死锁；注意到这一机制防止键盘输入中断导致的同步回显覆盖正常的sys_write获取tx锁的显示：在获取tx锁后不允许中断，从而不会在sys_write检查THR可输入后，中断抢先输入THR

> One example of a problem that could arise if p->lock were not held during swtch: a different CPU might decide to run the process after yield had set its state to RUNNABLE, but before swtch caused it to stop using its own kernel stack. The result would be two CPUs running on the same stack, which cannot be right.

指的是一方面另外一个cpu看到runable就swtch到这个进程，同时原进程还在yield中没有进入sched，导致两个cpu使用同一个进程的内核栈

所谓lock维护invariance，就是说这些变量只能在critical-region中发生修改，只能在持有锁时发生修改;这样先获取锁再修改，用来实现并发控制;教科书这里的意思是，A->B必须在把B的运行状态全部加载好【寄存器、栈、c->proc】后才可以释放锁

在内核态下，tp总是存储本cpu分配的hardid，以配合结构体cpu定位具体硬件;通过usertrapret保存，uservechuifu实现，因为用户进程可能修改tp;使用mycpu时要考虑由于定时器中断切换cpu导致的前后cpuid变化，这里通过禁止中断，直到使用完cpuid来实现

所有cpu遍历同一个进程列表

sleep&wake-up用于不同进程间的主动interaction:这里如果用轮询很消耗计算资源，因为一直在loop等待信号量非0; sleep-wakeup用于PV生产消费者模型，消费者没有信号量可以消耗时sleep，生产者生产一个信号量就wakeup所有本channel的进程
![信号量/轮询的实现](image-7.png)

sleep-wakeup可能导致 lost wake-up问题：在sleep之前wake，导致sleep一直等待一个已经完成的wake;这是因为预设的“只在信号量为0时sleep”被违反
通过给sleep也加锁，并在成功sleep后释放锁来实现【不然wakeup不能获得锁】，注意被唤醒后要重新获取锁，因为调用sleep本身在持有锁的上下文，sleep醒来后需要释放锁，但之前sleep前已经释放，所以需要重新获取
![图例](image-8.png)

信号量不是syscall_sleep中的内容;注意到信号量和channel并不绑定，这带来sleep-wakeup的健壮性：即使两个sleep-wakeup意外使用相同的chan，wakeup唤醒后各自检查对应信号量是否非零，由于信号量不同，不影响PV机制的正确运行；chan不必创建专用的数据结构，caller也不必知道自己跟谁交互，只通过chan唤醒就可
由于锁，wakeup要么在sleep之前进行【此时信号量不为0,不用sleep直接获取】，要么在sleep完成后进行

# 2025年12月4日

pipe【通过内核buffer传递数据】也使用了sleep-wakeup机制；pipe的结构体buffer使用nread/nwrite指针是回环的
piperead由于buffer是空的读不了就wakeup写 自己sleep；pipewrite由于buffer已满写不了就wakeup读 自己sleep
这里对于buffer的内容，也可以视为一个PV信号量模型，在PV模型上使用sleep-wakeup

sleep-wakeup可以用于child的exit与parent的wait，但是无法处理child先exit后很久parent才wait的情况
xv6使用ZOMBIE进程状态解决：子进程exit后设为ZOMBIE状态，等待wait注意到它；注意到后传回退出code和pid，置位进程UNUSED
如果parent不等child退出自己就exit,exit会调用reparent把自己的孩子全部标识为init的孩子；init-process【启动sh的进程】会在循环中不断调用wait【wait会检查调用进程所有的孩子进程是否是zombie，如果找到一个就释放进程并返回pid】；如果init发现存在孩子进程但是没有找到zombie进程，就sleep等待【wait是一个循环，只有没有子进程/自己被杀死或找到ZOMBIE时退出】

kill实际上是预约exit：退出内核时会检查p->kill，如果p->kill则调用exit自杀；而一个进程总会进入内核的【至少有定时器中断】
这样实现防止打断重要过程，而是在重要过程结束后退出内核时exit

在调度中引入进程优先级，可能导致优先级和锁获取的冲突：低优先级获取锁但是调度不到；高优先级可以被调度，但是没有锁无法运行
检查并sleep这一操作应当是原子的，为了解决这一问题【这就是lost-wakeup，在sleep前信号量变化并wakeup了导致死循环】有以下方法
保护信号量【FreeBSD给出condition-lock，检查condition并sleep的过程受到从地体哦那-lock保护，condition无法改变而从运行不到wake，从而不会浪费wake】
保护wake/sleep操作【Linux给出wait-queue保护所有检测condition-sleep过程和wake过程，要求检测condition-sleep时无法wake】

通过chan遍历进程数组搜索对应process低效率，可以把chan改为一种进程队列；wakeup所有chan对应进程让他们一一确定信号量【Called thundering herd】也应该尽量避免:Most condition variables have two primitives for wakeup: signal, which wakes up one process, and broadcast, which wakes up all waiting processes; 

显式记数wakeups的发生次数可以避免一部分wakeup问题

# 2025年12月5日

Lec13：sleep and wakeup
在swtch时不允许持有p->lock之外的锁，不然会导致有锁但sleep；由于acquire内禁用中断，所以会导致acquire不断尝试获取锁，且这一过程无法被打断

关于uart，分成两部分：两部分通过LSR实现区别，LSR告诉我们当前的#0寄存器时用于THR还是RHR，依据LSR的TX_IDLE和RX_READY位
1.uartputc、uartstart：前者将c写入utx_buffer并调用后者，后者尝试不断发送
2.uartgetc：尝试读取输入并返回
对于userintr，因为我们设置 rx准备好时 和 tx可以发送时 都要中断，所以userintr兼顾两方面工作，既尝试uartgetc然后传给consoleintr【写入console.buffer】，也唤起uartstart尝试发送tx_buffer内容

> UART实际上支持一次传输4或者16个字符，所以一个更有效的驱动会在每一次循环都传输16个字符给UART，并且中断也是每16个字符触发一次。更高速的设备，例如以太网卡通常会更多个字节触发一次中断。

一方面uartintr需要获得tx_lock来决定发送tx_buff到寄存器,一方面uartintr内调用的wakeup需要各个p->lock; 所以sleep保证不丢失wakeup需要获得p->lock,这样sleep需要释放掉uartwrite获得的tx_lock并获得p->lock【完成sleep内部修改后在sched释放p->lock】；必须释放tx_lock才能让导致sleep的情况改善

但是如果先release再acquire，会导致中断插入其中的可能，仍然lost-wakeup；故而要先获得p->lock再释放tx_lock；由于uartintr先检测是否可写，再wakeup【用p->lock】可以理解为先获取p->lock因为此时uartintr等待进入检测环节，所以不影响intr；释放tx_lock后uartintr检测完毕要获得p->lock又被堵住，逐层创造堵塞

> 希望uartintr不可能看到这样的场景：应当sleep的进程，tx锁被释放了但是进程还没有进入到SLEEPING状态。所以sleep这里将释放锁和设置进程为SLEEPING状态这两个行为合并为一个原子操作【通过p->lock】

# 2025年12月13日

用户态的线程切换
如果在gdb中直接break搜索不到指定函数，应当先用file certain_execuable加载可执行文件
注意swtch时要检查current为running,且当前线程不为调度器线程才置为Runable，如果已经free就不用runable等待调度

> (gdb) file user/_uthread
> Reading symbols from user/_uthread...
> (gdb) b uthread.c:60
> (gdb) p/x *next_thread ：以 十六进制（x）格式 打印 next_thread 指向的结构体内容
> (gdb) x/x next_thread->stack ：查看 next_thread->stack 所指向地址处的内容（以十六进制显示）。
 
进程内线程的结束不是exit，而是设置线程状态为free，如此scheduler就不会调用这个线程；schedule检查无线程可调用后，结束进程

状态量变化/检查状态量 和 wakeup/sleep之间要维护一致性，要加锁; 加锁可以保证，加锁的若干段都是串行进行，而不会某段在另一段之内运行；加锁只能保证串行，不保证顺序，所以多线程要避免对加锁段的顺序的要求，编写代码使得代码块可以按随机的前后顺序运行而保障语义

# 2025年12月16日

## file system
![文件系统是实现磁盘存储数据的其中一种方式，也可以通过数据库实现](image-9.png)
inode必须有一个link count来跟踪指向这个inode的文件名的数量。一个文件（inode）只能在link count为0的时候被删除。实际的过程可能会更加复杂，实际中还有一个openfd count，也就是当前打开了文件的文件描述符计数。一个文件只能在这两个计数器都为0的时候才能被删除。
文件描述符必然自己维护了对于文件的offset

![文件系统分层](image-10.png)

> disk可以被视为block数组，包括：
> block0要么没有用，要么被用作boot sector来启动操作系统。
> block1通常被称为super block，它描述了文件系统。它可能包含磁盘上有多少个block共同构成了文件系统这样的信息。我们之后会看到XV6在里面会存更多的信息，你可以通过block1构造出大部分的文件系统信息。
> 在XV6中，log从block2开始，到block32结束。实际上log的大小可能不同，这里在super block中会定义log就是30个block。
> 接下来在block32到block45之间，XV6存储了inode。我之前说过多个inode会打包存在一个block中，一个inode是64字节。
> 之后是bitmap block，这是我们构建文件系统的默认方法，它只占据一个block。它记录了数据block是否空闲。
> 之后就全是数据block了，数据block存储了文件的内容和目录的内容。

xv6的inode：64字节，包括type-nlink-size-directbn-idbn
dbn有12个，idbn有1个指向一个由bn组成的block：inode提供的文件大小上限是(256+12)*1024 Byte

查询字节的方式
对于8000，我们首先除以1024，也就是block的大小，得到大概是7。这意味着第7个block就包含了第8000个字节。所以直接在inode的direct block number中，就包含了第8000个字节的block。为了找到这个字节在第7个block的哪个位置，我们需要用8000对1024求余数，我猜结果是是832。所以为了读取文件的第8000个字节，文件系统查看inode，先用8000除以1024得到block number，然后再用8000对1024求余读取block中对应的字节。

目录 inode 指向的数据块中，内容就是一串顺序存放的 struct dirent（目录项 entries）；entry由【inode，filename】构成
通常root inode会有固定的inode编号，在XV6中，这个编号是1

block cache相关

# 2026年1月22日

进程维护fd、操作系统维护内存中的inode、盘上维护inode
xv6的盘空间，以block为单位
0 操作系统，1 superblock文件系统的基本信息，2-32 log, 32-45 inodes, 45 bitmap, 46之后数据块

sleeplock与spinlock
xv6用一个spinlock保护sleeplock；spinlock用于短时间持有锁，因为需要一直自旋，且从加锁到释放锁的整个过程中要关中断【spinlock在单cpu下如果出现等待，就是会导致死锁】
sleeplock允许获取锁失败时sleep，适用于长时间持有锁【IO】，也用于通过进程交换实现锁的释放【等待获取锁的进程下台，拥有锁的进程上台】
spinlock应当用于一小段独立连续的，不希望被中断打扰的cpu程序；sleeplock用于等待其他进程/设备工作的程序

__sync_synchronize()保证在它之前的所有内存读写在逻辑上“发生在”它之后的内存读写之前
这里一共两层锁，一个spinlock保护block-cache整体，一个sleeplock保护单个block【的cache】；具体来说，前者保护buf数组中的若干buf结构的各项属性，后者保护buf-block中的具体数据块内容

>The sleep-lock protects reads and writes of the block’s buffered content, while the bcache.lock protects information about which blocks are cached.

crash-recovery的问题：可能出现同一状态在两个不同位置的体现不统一【例如目录文件登记inode，和inode自身状态aild不统一】

> 用日志系统保证invariant: xv6 的系统调用不会直接写入磁盘上的文件系统数据结构。相反，它会把所有希望执行的磁盘写操作的描述先写入磁盘上的一个**日志（log）**中
> 当系统调用已经把它需要执行的所有写操作都记录到日志之后，它会向磁盘写入一个特殊的提交记录（commit record），用来表明日志中包含了一个完整的操作
> 在这一时刻，系统调用才会把这些写操作真正拷贝（应用）到磁盘上的文件系统数据结构中,当这些写入完成之后，系统调用会清空（擦除）磁盘上的日志

具体来说，通过disk上的log区域，head-block中的count是否为0标志commit与否：It consists of a header block followed by a sequence of updated block copies (“logged blocks”)；只有在commit时才写header-block
允许多个系统调用把他们涉及的文件操作积累到一次log中【group-commit】，即一次commit包含多次完成的系统调用；为了避免将一个系统调用拆分为若干段，日志系统只在不存在文件系统调用正在执行的情况下提交
由于xv6固定最大log空间，所以一次系统调用不能写或改动多于这个数量的blocks，注意write、unlink分别可能改很多data-blocks和bitmap-blocks【当某些文件ref=0,释放他的所有data-block，data-block的vaild与否体现在bitmap】
每个系统调用设置一个涉及block数量的上限MAXOPBLOCKS，从而只需要记录已经预约日志数量的系统调用数，就可以估计剩下的可用日志空间，以此决定是否纳入新的syscall/还是让begin_op等待
log_write记录block到log表中【此时的block一定在cache中存在】，以便后续write_log从cache写入log-block中【注意这里连续进行 cache->log，更新header标记完成，log->原位置 并非多此一举，而是为了减少cache->log的io次数：如果在cache->log / 更新header时出现crash，则不要这次更新；如果在log->原位置时出现crash，可以replay】
所以其实用log_write代替block_write时，前者作的工作很少，只是登记这个block到log中，并没有像block_write一样写回内存
![典型文件系统调用过程：begin_op,bread,log_write,end_op](image-11.png)
begin_op增加outstanding记数【正在处理的系统调用数】，end_op减少outstanding记数并尝试在outstanding=1时提交commit

> recover_from_log (kernel/log.c:116) is called from initlog (kernel/log.c:55), which is called from fsinit(kernel/fs.c:42) during boot before the first user process runs (kernel/proc.c:539). It reads the log header, and mimics the actions of end_op if the header indicates that the log contains a committed transaction.
> log系统初始化时调用recover_from_log，从disk的log读取header并进行commmit，如果log.lh.n!=0则会用disk中的log更新原位置，起到crash-recovery作用

# 2026年1月24日

inode在内存中通过itable暂存：iget查找并获取inode的inmemory-copy的指针，iput释放指针【减少ref-count】；通过iget与ilock分离，提供非单一的inode访问指针【多个进程可以同时持有某个文件的指针】，但是要求操作文件前使用ilock加锁；ilock在bcache中查找对应的inode；ialloc在disk上查找free的inode【通过加载block到bcache】如果找到则iget获取一个itable的空位指针，并ilock在对应block查找这个inode
iget不加锁可以在查找目录时体现：如果查找.当前目录并获取inode，在iget需要获取锁的情况下会造成死锁【运行中进程持有当前目录锁，查询.的inode又需要持有锁】
inode的修改是写回的，即直接写回到disk；ialloc查找disk上空闲inode时通过给block加锁保证inode分配时不会把一个inode分配两次

即使readonly的syscall也需要包装在transaction【begin_op】中，因为可能iput释放某个文件从而写disk
考虑link==0但是ref!=0的情况，此时如果发生crash，恢复后导致存在一个文件inode虽然nlink==0但是仍然保存在disk上【正常情况下应当在ref--时释放】；xv6没有处理这个问题
解决方法有2：1是每次reboot扫描整个文件系统查找存在但没有link的文件；2是在superblock中维护一个nlink=0但ref!=0的inode数组，通过logging在一次commit中提交unlink和这个数组的更新保证一致性，reboot后从数组删除这些unlinked的inode即可

balloc查找bitmap中空的块并登记到bitmap、清空选中的块；Bmap return the disk block address of the nth block in inode ip. If there is no such block, bmap allocates one.；实际上是bmap中调用bread实现没有分配块就分配一个并返回

namex给定path，寻找path对应的文件/目录的inode，也可以寻找path对应的文件或目录的父目录的inode；这里ilock调用是为了防止对应的inode还没有加载，作加载inode【根据inode中的dev、inum加载inode的addr和其他状态量】
考虑是否会出现逐层搜索时目录【inode-name】还没变但是实际inode已经释放的情况？查找时逐层获取并释放inode的锁，本次迭代过程中inode不会变化，所以不会出现上述情况

file-descriptor是file的指针数组，每个proc进程结构有一个指针数组；全局存在一个file数组，存储所有打开的文件和读写offset

这里提到的transcation是用log跟踪程序运行；清理程序可以解决分配inode时inode状态与bitmap状态不统一的问题，但是不能解决“存在分配后数据块和bitmap相应位置标记，但是没有写入inode的addr”

xv6当前直接通过fs管理磁盘块号，在fs中硬编码磁盘布局；磁盘驱动给出读写接口；以上处理无法应对多磁盘共享fs的需求；现代的解决方案是在物理盘上模拟逻辑盘/逻辑卷

# 2026年1月25日

## Lec15：clash recovery

crash-recovery是为了解决例如一个datablock属于两个文件、一个inode被分配给两个不同文件【希望磁盘block要么是空闲的，要么只分配给一个文件】；crash包括电力故障、内核panic，错误源于文件系统操作总是包括多个步骤

一种源于数据库的解决办法logging【write-commit-install-clear】：注意commit时写回log指出的block，也写回log-header【commit的具体实现顺序是log cache->log disk, header从mem到disk，log disk到home disk】；xv6的理论部分是说，write部分对应options->log disk,commit部分对应header从mem到disk，install对应log disk到home-disk，clear部分也包装在commit()函数中【log.lh.n=0并写入disk】
如果header没有成功写入，认为不发生此次事务；write-ahead-rule所有写操作在commit【写入header】之前完成,指的是具备原子性的写操作需要将他们先全部写入log后再移动到文件系统的实际位置

xv6的文件系统调用总是begin_op开头、end_op结尾表示所有之内的操作是原子性的【实际上只跟踪outstanding正在运行的文件系统调用】；logwrite登记blockno到mem中的log，并bpin保证对应的bcache不被释放掉；由于xv6的block写入是原子的，不会出现写入一半的header

challenges：
block-cache已满但都被bpin等待commit，导致无法换出block-cache；这里xv6直接panic处理
写入的内容超过log块的数量：拆分一个file_write为多个写事务
并发文件系统调用：如果存在多个事务同时使用log空间，用完空间但每个任务都没有完成；此时不能提交任意一个事务，因为没有完成；通过限制并发数来调整，如果太多并发文件系统操作，在begin_op中sleep当前事务

## Linux 的 ext2fs 文件系统
![POSIX是一套操作系统接口](image-12.png)；文件系统考虑持久性、可预测性、原子性

为确保系统崩溃后能实现可预测的恢复，恢复阶段必须能够解析文件系统崩溃时正在执行的操作——尤其是在磁盘上发现代表未完成操作的不一致状态时。通常，这就要求文件系统在**单个更新操作**涉及修改磁盘上**多个数据块**时，必须按照可预测的顺序执行磁盘写入。
实现可预测【每个单独的对disk的写入操作逐一进行】，简单的方法是同步写入：对于包含多个数据块的事务，一个一个写；改进为“延迟有序写入”，要求按块间依赖顺序有序写入【会出现循环依赖】；改进为“soft updates”避开循环依赖，通过撤销某个块内的“被依赖更新”【存在其他块的更改依赖于这个更改】打破循环依赖【实际上依赖的是更新语句而非块】

所有这些方案存在一个共同局限：尽管它们能确保文件系统操作过程中磁盘状态始终处于可预测状态，但恢复过程仍需要全盘扫描以发现并修复未完成的操作。这使得恢复可靠性得到提升，但恢复速度未必能获得实质性改善

然而，存在保证可预测性的同时实现快速文件系统恢复的方法，这通常通过保证文件系统更新原子性的文件系统来实现（在此类系统中，单个文件系统更新通常被称为一个事务）【通过允许写入disk但直到commit才移动到home-disk位置】，设计模式例如：
网络文件系统WAFL的树形文件结构和更新方法【“Write Anywhere File Layout”将所有文件系统元数据【inode、块映射、空间信息】组织成一棵B+树，更新文件实际上是创建新节点并改变指针指向】
日志结构log-structure文件系统【整个磁盘就是一个巨大的、连续的日志。所有数据（你的文件内容、目录信息等）都作为“日志条目”顺序写入】
journaling文件系统【通过将未完成更新的新版本暂存至磁盘独立区域来实现版本保留，待更新提交后，文件系统再将新版本写回其原始磁盘位置】

虽然journaling源于数据库，但是os中的journaling系统与传统数据库存在两个显著不同：os不存在abort事务，且os的事务相对短命；可以据此给出一些os上的日志实现的改进
ext2fs将journaling功能作为文件系统预留的一个inode文件，即维护一个journaling-file
当内核尝试 mount 一个文件系统时，内核会先读取 superblock并查看其中的 feature flags（兼容性位），将这些 flag 与 自己支持的特性集合做匹配，根据匹配结果，决定 mount 行为【mount后对文件系统可读/可写】

这里的journal只在commit时记录文件系统的metadata-blocks；存储三种blocks：metadata-blocks存储元数据blocks，descriptor-blocks存储journal的metablock和真实位置的对应关系，header-block存储当前有效log的起始终止位置【在journal-file中循环存储metadata和descriptor的起点终点】

# 2026年1月29日
xv6的日志系统的缺点在于，文件系统调用都是同步写，且由于日志需要写磁盘两次；
ext3fs的disk布局与xv6类似，另外对每个transaction维护了(序列号、包含的block-cache编号，若干系统调用handle)，允许同时跟踪多个不同执行阶段的transaction
具体来说，ext3fs的log区域维护一个superblock给出首个事务的序列号和在log中的起始位置，每个事务包括(descriptor-block描述后续block与disk-blovk的对应关系，若干更新的实际block，commit-block)，其中descriptor-block和commit-block各有一个magic-number作为标识
ext3fs的log空间内，总是存在若干已经完成commit的transaction，和一个正在进行的transaction；磁盘异步地将这些完成commit的transaction写回实际目标空间并释放锁占用的log空间
ext3fs通过异步系统调用、batching 和concurrency提升性能：
异步系统调用是说，系统调用只需要修改缓存中的block，不需要等待disk写入【带来的问题是，系统调用返回不能表示工作完成，提供了fsync调用作为强制等待写入disk后返回】；concurrency是说文件系统可以并行完成写磁盘操作【这里包括两种concurrency，一是通过复制一份block实现对正在commit的transaction的block操作，二是可以多个不同状态的transaction同时存在并同时写磁盘】；batching：每个若干秒启动一个transaction，在这若干秒结束后commit这个包含大量系统调用的大transaction【优点在于分摊固有损耗，触发write-absorption，优化disk-scheduling】
与xv6类似，上文的大transaction是复合事务，而start/stop间为若干需要实现原子性的文件系统操作，也称为事务；start返回一个当前系统调用的handle，在handle内登记本系统调用需要的blocks

transaction的commit过程：这些disk上的移动是通过后台内核进程完成
- 阻止新的系统调用，等待transaction中已经开始没有结束的系统调用结束【完成对cache的更新】
- 完成所有之前transaction的系统调用【更新cache中数据】，开始新的transaction【执行新的系统调用，即对cache修改】
- 此时根据本transaction的各handle更新descriptor，并将被修改了的block在cache中复制一份，将复制体写入disk-log
- 写入commit-block；从log写回home，释放log空间

start获取handle时要声明可能涉及的最大block数，这样提前判断防止log空间不够用；如果有一个数据block开头也是magic-num，则在他的transaction中为这个block标记一次，并把数据block的这个字节置0，写回home时换回；
考虑如何从crash恢复【由于同时存在多个可能没有完全写回的transaction，所以需要恢复多个transaction】：先从superblock记录的最早的未完全写回transaction的descriptor开始遍历，直到找到commit-block之后不为descriptor【说明这个transaction写入后没有下一个事务写入】/descriptor后没有找到commit【找到了descriptor，这说明这个transaction没有完全写入】的最后一个commit，从第一个descriptor开始恢复到最后一个commit；此外，在descriptor和commit-block内由匹配的序列号，防止出现小概率下部分写入导致的异常【例如部分写入覆盖原descriptor，导致原commit看起来和信descriptor匹配】
xv6相比，缺少在log中包含多个transaction的能力，同一时间只能在log-disk中存在一个transaction；且不支持同时进行“运行系统调用”和“commit到disk”同时进行，这实际上源于将cache的内容拷贝一份，使得两项工作可以在两份文件上进行

## lab 网卡
驱动设备的BAR配置：分配空间【以配置信息位数决定对齐的块大小】，存储DMA的内存地址和配置信息
由两处DMA映射大量设备寄存器：PCI配置寄存器、e1000设备控制寄存器

# 2026年2月2日

系统接口设计分析主题的论文，讨论虚拟内存的原语设计和实现方法，以符合用户程序对虚拟存储的管理需求，允许软件深度参与内存管理
原先只有os使用mmu的页保护机制实现若干“技巧”，实际上用户程序也可以使用这些技巧，包括：Concurrent Garbage Collection【栈存储指针，对象在堆上】，Shared Virtual Memory，Concurrent Checkpointing，Generational Garbage Collection，Persistent Stores、heap compression、Data-structure aliasing
提出以下os向上提供的虚拟内存原语：trap【When a user process attempts to access a protected page, the fault-handler is invoked】，prot【降低页的可访问性】、unprot，dirty查询上次调用dirty以来的脏页，map2【一个物理页映射到两个不同虚拟地址】，summary【返回页保护状态信息】
通过感知页面的“读写权限”和“脏状态”来优化高级程序的运行效率

Concurrent-GC：Baker's algorithm
将**虚拟**堆空间划分为from-space和to-space，GC开始将from-space中的内容复制到to-space【从寄存器和栈中内容开始，逐层复制；复制内容并修改【vaddr】指针"forwarding"】；当unscanned内容需要访问，导致trap，先复制到to-space并更更改指针，然后恢复运行
这里用map2实现程序和GCollector的不同访问允许水平

Shared virtual memory:SVM system
通过网络访问计算机，每个node从共享虚拟内存中分得一部分；readonly的页可以在多个处理器的内存中存在，但正在被写入的页只能在一个处理器的内存中存在

Concurrent checkpoint：如何避免在制作ckpt前全部停止
避免一次性保存所有可写内存空间：所有地址空间设置为read-only，ckpt程序开始制作副本；每当复制完成一页，恢复为可读写页；当需要写入一个没有copy完成的页，则trap并先copy这一页，完成后继续用户程序；也可以与dirty结合，在制作ckpt时只考虑dirty页把他们置readonlyS

Generational garbage collection：新对象通常是临时的，旧对象通常是持久的【一是分批gc，二是dirty减少检查数量】
实现若干个generations，Gi的i越小越旧；每个Gi满了之后进行collection，如果没有被gc则进入更旧的Gi；由于gc需要扫描有无指向本对象的指针【没有时才可以回收】，可以令old-generation不可写，每次尝试写入会导致dirty；gc时只需要检查这些dirty的页即可

Persistent store:在程序间实现持久存储的heap，以访问内存的方式访问
常用的实现方式database通过事务实现一致性较慢；面向对象的数据库提供更快的heap访问和一致性保护

Extending addressability：现代磁盘地址空间大于2^32不能被processor直接使用，可以设置一个32->64的翻译表，并用页表fault实现转换

Data-compression-paging
实际上很多linked-data-structure的取值很小用不到32位[只需要8bits]，从而这样的一页可以被压缩为1/4页；在对待LRU-page时除了放到disk，也可以压缩存储在main-memory实现比从disk读取更快的恢复

Heap-overflow-detection：stack上设置为不可访问导致trap来检测stack访问越界；相同的技巧可以用于在gc中检测heap越界【通常方法是比较地址】，实现方法是加入guard-page代替分支语句

# 2026年2月3日

文章设计了若干测试程序，旨在反映cpu运行以上原语的速度【希望不受disk速度影响】；可以用原语时间/add指令【一个一般的指令】时间来跨架构比较原语的实现效果

由于protn和单页unprot，需要更新TLB表项：如果unprot不会错误利用TLB，如果prot可能导致TLB中存储的权限大于真实权限，所以必须在prot时刷新TLB【称为TLB shootdown】，然而同时多页shootdown的耗时与单页无明显区别【这也是为什么提供protn原语】

Optimal page size:页cpu来处理page-fault时，错误处理时间常常与页大小正相关，overhead则包括磁盘旋转和可以忽略的计算耗时等，为了平摊overhead，常常大page-size
然而当用户程序处理page-fault，不存在磁盘的overhead，所以可以更灵活地调整page-size

Access to protected pages:通过map2实现，或者通过三次“从protect页复制”的专用系统调用实现
以并发GC为例，collector可见from-space和to-space并且都是可读写，mutator不可见from-space【指的是对应页的属性为不可访问】，to-space没有复制完成的部分也不可访问【以上虚拟地址都在同一个页表内，对from/to-space的两次映射】

> 例：不妨认为虚空间分为以下三部分；不妨令from为不可访问，约定mutator使用to:mutator区域地址【完成copy的部分rw，未完成部分inaccessable】，collector使用to:collector区域地址【均为rw】
> from
> to：mutator
> to：collector

认为对于物理地址缓存的计算机，map2是一种简洁高效的解决方案，避免了切换进程导致的巨大上下文开销；虚拟地址缓存block可能导致缓存不一致，但可以通过及时的flush解决

heap-overflow依赖发生异常时的寄存器内容来精准定位page-fault发生时堆地址并重定向到新堆；然而这里提到的其他程序不需要定位发生时状态，只需要进行与寄存器状态无关的处理程序然后继续；考虑流水线难以实现精确异常【精确定位异常发生时状态，因为存在乱序发射】，只能“resume”难以“restart”，所以通过修改寄存器实现的heap-overflow不适应流水线

# 2026年2月4日

## Lec 17：virtual memory

用户程序也应该可以修改页表的pte的protection位，从而灵活使用page-fault【内核中几乎所有的虚拟内存技巧都基于Page Fault】；也应当在kernel中检测page-fault中断后，在用户态执行处理程序trap-handler

为什么protect需要清除TLB？protect指rw->readonly,如果TLB中保护位不变，则可能允许write【实际上不希望允许write】导致页保护失败【非法程序正常运行】；unprotect指readonly->rw,TLB中保护位是readonly，如果write则触发fault可以在fault中修正TLB保护位

系统调用mmap将文件映射到进程的虚拟内存地址空间，将文件描述符指向的文件内容，从起始位置加上offset的地方开始，映射到特定的内存地址，并且连续映射len长度
也可以映射匿名内存，分配不与任何文件关联的纯内存区域到虚拟地址【作为sbrk【管理堆空间的函数】的替代方案】

系统调用mprotect更改access权限保护虚拟内存；sigaction指定信号处理函数
进程的地址空间中包含VMAs，记录连续虚拟地址【section】的信息，mmap时创建；相比pte中的权限访问更快，提供更多的元数据甚至指定sigaction信号处理函数

允许用户给出page-fault-handler会导致安全问题吗？
handler与设置了它的应用程序运行在相同的context，相同的Page Table中。所以handler唯一能做的事情就是影响那个应用程序，并不能影响其他的应用程序，因为它不能访问其他应用程序的Page Table，或者切换到其他应用程序的Page Table

可以利用page-fault在较少的page内表示一个巨大的表单：考虑用表单缓存函数F(i)的i=1,2,3,4...计算结果，并mmap到一段很长的虚拟地址但不分配物理地址；每当尝试访问这个表单某一项table[i],引发page-fault：分配物理地址并计算本页【table[i]所在页】表单值；可选择释放前若干次通过这样pagefault分配的物理页，从而保持较低的实际page，表示一个大量虚拟page构成的表单

GC指的是高级编程语言通过new/malloc在堆中获取的内存的free工作;论文中介绍的copying-GC需要[拷贝内存,修改指针,扫描copy的对象来查找指针]，在from空间保留一个forwarding指针。这里将对象从from空间拷贝到to空间的过程称为forward；gc从root开始搬运，不断scan新搬入的对象查找指针继续搬运
Baker方法实现realtime的拷贝代替stop-copy-resume：先移动root对象并修改root指针，gc与mutator并行；用户程序和gc检查每个指针是否指向to-space，如果不是则forward后返回继续运行【存在问题：大量检查语句，gc与应用程序并行时可能重复复制【这是因为这里实现的“读屏障”即检查ptr指向，是普通语句没有原子性保护ptr同时只被一个进程访问，多核下可能同时检测到ptr指向from-space然后尝试复制】
forward-ptr在这里用于更新“多对1”情况下，多个指针指向本对象：一次copy只改变了查找到本对象的一条指针，改为指向to-space，可能有其他指针仍然指向from-space中的本对象，forward-ptr用于更新这些指针；vm实现下也存在，用于gc复制不参与mutator
论文提出用虚拟内存改进：将heap内存中from和to空间，再做一次划分，每一个部分包含scanned，unscanned两个区域【这里的“读屏障”不通过普通语句检查而是通过VM访问引出page-fault，VM由互斥锁保护，实现了gc与mutator的并发】
根对象移动到to-space的unscanned区域；gc第一次访问根对象得到page-fault，page-fault扫描本对象，把其中指针指向的对象复制到to-space的unscanned区域，并把本对象移动到scanned区域；接着继续扫描unscaned区域的对象重复上述工作
注意！mutator手中的指针总是在to-space的【因为一开始修改了栈和寄存器中的指针位to-space，mutator总是通过这些指针来访问】；mutator只可见to-space的scaned-space，如果通过指针访问unscaned区域导致page-fault，则scan本页、复制指针指向对象，移动本页到scaned【所谓移动到scaned就是更改protect标志位】
通过map2实现gc和应用程序作为两个线程共享一个页表，但对相同物理地址有不同访问权限

简单实现中，所有ptr都用read_ptr包装，以在其中要么直接获得指针，要么引起page-fault获取指针
shm_open是一个Linux/Uinx系统调用。Share-memory object表现的像是一个文件，但是它并不是一个文件，它位于内存，并没有磁盘文件与之对应

# 2026年2月6日

## Paper: Micro Kernel
MicroKernel认为内核只进行少数工作【地址空间映射、线程调度、进程间通信】，把传统宏内核的fs、driver、网络协议栈运行在用户空间视为用户程序
本论文做了若干实验，测量L4第二代micro-kernel的效果：测试包括基于管道的IPC，一些与映射相关的操作系统扩展，用户级实时的内存管理系统

OS = 内核 + 系统服务 + 库 + 用户界面（Shell/GUI）；宏内核通常被视为一个单一的、庞大的二进制文件。其结构可以从下往上分为几个逻辑层，但物理上它们都在同一个内存空间运行【整个内核就像一个巨大的 C 语言程序，通过函数调用协作各功能，函数调用的开销极小，只是几次寄存器操作和指令跳转】
微内核只有极小的内核空间，各种传统意义上的kernel服务作为独立进程运行在用户态，拥有各自独立的地址空间【**即不能通过函数调用协作，而是使用IPC通过消息协作，这需要大量的上下文【地址空间】切换**】

现在需要解决如何把宏内核的os移植到微内核：L4Linux 并没有把 Linux 变成“一堆碎片”，而是把 Linux 当作一个运行在 L4【微内核】之上的超级应用程序【微内核下称这样提供系统功能的内核外进程为server】；只修改linux的硬件相关部分，缺点是性能可以再加强【因为没有对linux做结构性修改】，优点是易于继续移植新版本的linux,可以直接运行所有现成的linux软件

L4 的一个基本思想是支持由内核之外的用户级服务器递归构建地址空间；初始地址空间sigma0 基本上代表了物理内存，后续的地址空间可以通过授权（grant）、映射（map）和撤销映射（unmap）flexpages 来构建【Flexpages 是大小为 2^n 的逻辑页】

L4 引入了一个非常独特的概念：递归构建地址空间，所有地址空间都由用户级 Pagers【分页器】构建和维护【处理缺页异常】；内核仅实现 grant、map 和 unmap 操作【用于分发sigma0物理空间的页】；可以存在若干个Pager，各线程指定自己关联的Pager以获得共享的地址空间；不同的Pager可以实现不同的内存管理策略
**I/O 端口**被视为地址空间的一部分，因此可以像内存页一样进行映射和撤销映射；硬件中断则被kernel发送给硬件驱动线程

中断是突发的，但Exception/Trap一定是当前运行程序导致的【即对触发线程是同步的】；L4在发生异常时调用内核的异常处理程序【查异常处理向量表】，kernel异常处理程序记录发生异常的线程地址和标志位到user-stack，然后pc改为用户态的异常处理程序并返回用户态【从线程看就像一直在用户态，发生异常后进行本地址空间内的异常处理函数调用】
考虑一般处理器只提供一个IDT，即内核只能为每种异常提供一个处理程序；而L4允许同一个异常在不同进程下运行不同的异常处理程序

Tagged TLB 用于支持多地址空间，避免上下文切换时刷新整个TLB：每个TLB条目除了保存 虚拟页号→物理页号 的映射，还附加一个 地址空间标识符（ASID/Tag）；当CPU进行地址转换时，它同时比对 虚拟页号 和 Tag，只有两者都匹配，该TLB条目才有效；这样，不同地址空间的映射可以共存于TLB中，切换地址空间时只需更改当前Tag值，无需清空TLB。

L4 在 Pentium 平台上的一个特有功能是小地址空间优化。每当地址空间当前使用的部分较“小”（4 MB 到 512 MB）时，这个逻辑空间可以同其他小空间的logic-space占用同一张物理页表，并由 Pentium 的段机制（Segment mechanism）进行保护【方孩子不同进程相互访问内存】；具体效果模拟了小空间进程之间的Tagged TLB
在其他例如Alpha平台上利用各平台的特殊硬件做了优化

Linux 的硬件无关部分包括：进程和资源管理、文件系统、网络子系统以及所有设备驱动程序，总共约占 Linux/x86 内核及驱动源码分发包的 98%；实际上硬件驱动程序部分依赖于特定硬件

除了可能需要更换设备驱动程序外，将 Linux 移植到新平台应该只需修改系统的硬件相关部分。这部分完全封装了底层硬件架构。它提供对中断服务例程（ISR）、底层设备驱动（如 DMA）的支持，以及与用户进程交互的方法。它还实现了 Linux 内核上下文之间的切换、在内核与用户地址空间之间传输数据的 copyin/copyout 机制、信号处理、用于构建地址空间的映射/撤销映射（mapping/unmapping）机制，以及 Linux 的系统调用机制。从用户的角度来看，它定义了内核的应用程序二进制接口（ABI）。

isa基本只规定cpu和内存，其他的设备操作和映射由platform来决定；platform可以提供isa之外的机器指令【cpu支持厂商特定的扩展指令集】，规定外设到内存的映射【使用DMA时】；os使用isa和platform共同给出的指令集并集和内存映射模型，实现kernel和其他系统功能

L4linux的用户程序缺页异常时，L4接收到硬件异常；找到本页对应的pager将硬件异常转换为一次IPC由pager【在L4linux中，这个pager是linux-server，它将自己从sigma0获得的空间map给各个用户程序】发送给用户进程，pager给用户程序map/unmap若干页面作为响应

系统调用实现【法1、2针对linux系统中已经形成的可执行文件】：法1-修改动态链接库，改syscall为L4提供的IPC【进程间通信】原语与linux-server进程通信【动态链接库只需要改syscall的”符号-地址”对应即可】；法2-修改静态链接库【由于是编译完成二进制程序，需要重新编译】；法3-Trampoline机制，L4内核接到int 0x80,视为异常，跳转到用户进程的异常处理程序入口，用户的异常处理程序可以包括到linux-server的IPC；第三种机制兜底保障，但是由于需要kernel到user-trampoline的IPC，所以性能比直接修改动态依赖库差

原生的 Linux/x86 内核总是将当前用户地址空间映射到内核空间【宏内核把当前进程的页表映射全部映射到内核空间的高端】；执行 Copyin 和 copyout（在内核与用户空间传递数据）时只需简单的内存拷贝，地址翻译由硬件完成；L4Linux下发现以上方法效率差，选择让 Linux server 解析用户进程的物理地址，通过物理地址拷贝

# 2026年2月7日

信号处理:在 原生 Linux (宏内核) 中，内核拥有最高权限。当内核想给一个进程发送 SIGINT（断开连接）信号时，直接修改该进程的寄存器，把执行位置跳到信号处理函数;L4linux中，服务器进程不应该允许修改其他用户进程；于是在每个user-process中实现一个signal-thread来修改用户线程的寄存器，即跳转到信号处理函数【如果user-process有定义则如下传导；如果没有则server直接同L4-kernel通信完成】
![信号传导](image-13.png)

调度：L4微内核kernel拥有一个调度器，处理线程调度；传统的linuxschedule()处理linux并发系统调用产生的协程(Coroutines)【Linux 内核内部用来模拟多内核线程，在单个 L4 线程内保存不同内核线程【对应不同用户进程的系统调用】的执行上下文】，这里要求协程在有就绪协程时不立刻切换，而是等时间片耗尽或特殊需求再切换，这样意在减少协程的上下文切换次数，每次从头到尾完成运行协程

为了缓解TLB失效【时间片小的情况下需要大量flush也类似失效】的问题【一方面现代程序依赖大量庞大的库文件，一方面各个程序往往有相似的虚拟地址使用分布【例如都使用特定区域】导致总是要flush】，L4linux提供一个映射库允许把依赖映射到低地址空间，创造小地址空间进程，避开与传统3G页表的linux程序的TLB撞车，减少flush

对于内核空间和用户空间如何反映在一张页表中，要么在用户进程的页表中加入内核映射，要么在内核页表中加入当前的用户空间映射；后者需要频繁更新页表，为了实现前者需要加入linux-server的同步机制【因为此时可能多个用户进程同时访问内核】，为了在低空间映射内核，导致前文小空间进程优化失败，速度较慢；最后决定用户进程空间不加入内核映射，缺点是任何 copyin 和 copyout 操作（内核与用户间的数据拷贝）都必须通过软件将虚拟地址翻译为物理地址

Mach 的 IPC（进程间通信）和页错误处理太慢，导致其上的 Linux 性能大幅下降【无论是co-located的内核server还是一般的用户进程server都明显弱于L4linux】；

微内核的优势在于宏内核难以企及的稳定性、可扩展性和实时能力；能够单独的方式改进并实现某个特定功能，并不影响现有功能；同时，在部分功能上采用L4-kernel而非linux的api可以达到更快的速度【这是因为pipe要维护若干状态，例如是否有读写端，还需要两次拷贝数据(从用户到内核缓冲区到用户)】

RPC是用“函数调用的语义”封装 IPC，一般是阻塞式调用【等待返回结果】；pipe测试中为什么同步映射RPC带宽极高，是因为其他测试都把pipe内容从内存复制一份，而RPC只建立页表映射没有在内存中搬运数据【实际上这样64kb的数据不会在栈中，所以不需要复制到栈中，只需要在本进程的地址空间中选地方存储即可；pipe和rpc的结构都是在用户态进程地址空间中存在一页是ping过来的数据】

> Linux 在管道通信中会拷贝两次数据，但在内核中使用固定的单页缓冲区。对于长数据流，读/写该缓冲区总是能命中一级缓存（L1 Cache），因此这种特殊的双重拷贝执行速度几乎与单次 bcopy 一样快。
> 指的是dst-program几乎不需要访存，只通过L1-cache完成对pipe-buff的读取；逻辑上需要进行的两次访存【src->pipe_buf,pipe_buf->dst_buf】，后者被简化为从cache读取【L2(src) → L1(pipe) → memory(dst)而非memory → memory → memory】

微内核允许“Linux”与“高性能实时内核”在一个硬件上并存，前者负责常规任务，而高性能任务【比如大量数值计算】可以直接利用 L4 的底层原语（如映射、快速 IPC）运行，互不干扰

“嫁接模型”（grafting model）是否能进一步提升微内核的性能【嫁接（Grafting） 处理的是如何将一段“嫁接代码”（即扩展插件）插入服务器【这里关注插入内核时是否比单独作为用户进程效果好】的问题】
考虑比IPC更底层的PCT【PCT 将当前线程带入另一个地址空间，因此活动线程集不会改变；IPC 将消息从发送者线程传输到目标线程；两个线程都留在各自的地址空间中，但活动线程集发生了变化】，运行速度稍快，但IPC实现更多功能

有了延迟调度，IPC 的切换开销被降到了极低，几乎等同于一次函数调用；延迟调度是指，当 A 通过同步 IPC 调用 B 时，内核直接将 CPU 的控制权交给 B 的地址空间，并开始执行 B。此时，内核并不会把 A 从“就绪队列”移到“等待队列”，也不会把 B 从“就绪队列”移出来；同时二者的进程状态也不改变

# 2026年2月9日

宏内核的优点：可移植、对应用程序屏蔽复杂性、统一管理资源、方便跨子系统的调用，统一高权限
宏内核的缺陷：大而复杂，通用导致更慢【无法实现特定场景的优化】，应用程序无法实现更精细底层的操作，可扩展性更低

微内核的核心是IPC【进程间通信】和线程与任务的tiny-kernel，kernel只负责进/线程的调度和IPC【不维护全局的对象】
另外几个动机：更小而可验证，容易优化，可能更快，代码间约束更少，容易定制化，更少导致内核panic，允许内核上跑多个os【分别负责不同任务】

如何设计内核的系统调用以满足应用程序的需求，具体多少个系统调用、各有什么作用？linux存在350个、L4只有7个
L4的抽象只包括Task【进程空间】、线程、IPC；宏内核中syscall主要负责与内存和外部设备的交流，所以将linux实现在微内核上只需要用L4提供的syscall代替原本linux中的系统调用【功能上主要是内存、外设、中断】

L4linux的实现中，与传统linux进程与内核线程一一对应不同，允许若干个系统调用【内核线程】同时运行且与用户进程并行运行
为什么不把linux内核线程用L4线程实现？时代原因，既没有多核cpu来提升L4线程并行的速度，也没有可以在多核上运行的linux版本；这导致后续linux在多核上的调度优化无法发挥

微内核没有真正流行过，因为它没有明显比宏内核更好

# 2026年2月10日

## Lab:lock

尝试减少锁等待/竞争的时间，可以用acquire lock的次数衡量
认为锁争用的原因是kalloc只有一个空闲列表和一个锁，可以在多核机器上每个核维护一个空闲列表和锁

包括物理内存分配的锁，bache访问内存缓存块的锁:希望把大锁拆分成小锁，要建立从资源到锁的映射
对于kalloc的物理内存分配【锁保护的资源是 **无状态** 的空闲页】，注意到总是某个cpu运行的进程去尝试获取，所以可以建立cpuid->lockid；由于除了cpuid没有什么可以依赖的状态【来找到对应的锁】，所以用cpuid
对于bcache，注意到bcache保护的资源是 **有状态** 的buf数组【其中存在空闲buf也有有效buf】，对它的操作时根据状态查找，此时如果能设计一个状态->lockid的映射，会更快找到对应buf
根据被lock保护的资源的使用方法设计lock与调用lock的context的映射

尽量缩短持有锁的时间；查询需要锁保护的对象时，如果后续依赖这个查询的属性，需要持有锁防止属性变化；注意分类讨论多锁情况下两把锁相同的情况；可以加一把eviction锁来保护多锁过程,注意释放锁后double-check释放后的变化

# 2026年2月11日

一种简单的多锁情况下避免死锁方法，按顺序加锁;
遍历若干锁保护的资源时，渐进获取并释放锁相当复杂麻烦；法1获取全部锁 Stop-the-world;法2 探测-排序，每次只探测不保持持有锁【有探测结果变化的风险】，探测后二次验证，如果失败继续探测【有live-lock的风险】
这里逻辑相当复杂，容易忽略某些情况！最好先写一版逻辑清晰，结构可以复杂【多if-else】的代码，然后简化

# 2026年2月12日

Lab: fs, add large files and symbolic links to xv6 file system
bfree传入dev和dev上的全局块号

出错在多级idx块要逐个打开，不要出现打开层次错误把idx当数据打开了

## Chapter 9: Concurrency

考虑块缓存，如何解决两个进程同时希望读取块？xv6在每个block的自旋锁【保护"已存在的bcache串行访问"】之外，使用一个额外的锁bcache保护[缓存块集合]【“保护 block读取 这一行为是串行的”】
一个常见的模式：一个用于管理集合的锁，外加每个条目一个独立的锁
锁在必须表现为原子性的序列开始时被获取，在该序列结束时被释放；锁的功能是强制其他使用者等待，而不是将一段数据固定在某个特定的代理（Agent）上【锁的获取和释放可能发生在不同的 CPU 上，例如调度yield和inode获取与释放的ilock】

释放一个受本对象内部嵌入锁保护的对象是一件棘手的事情，当你释放本对象，锁也被释放了；然而可能存在另一个进程B不断acquire这个已经被释放的锁；这实际上是因为进程B手中的指针是悬垂指针，解决方法是维护一个引用计数，引用计数不应该被这个锁保护，而是依赖其他锁、配合原子指令【原子地decline并检测0才释放；或者原子地检测是否为0,是则返回false,不是则+1】

soft-lock：用互斥锁保护的标志位/引用计数，作为可由多个进程持有的“共享锁”
例如namex按绝对路径查找，如果只使用spinlock，需要逐段获取inode，并在持有父目录inode时获取子inode；这会在查询/a/./b时尝试获取已经持有的锁；如果先放锁，再锁下一个，可能在完全释放了a的一瞬间，另一个进程正好执行了 unlink("a") 把这个目录删掉了，或者把这块内存回收了；加入引用计数后，在加锁之前refcount++，在释放锁前refcount--并检测refcount==0时释放；使用引用计数时，只需要在持有两把锁的间隙增加引用记数就可以保证子inode存在

常规锁（Lock）：保护的是数据的一致性（防止两个进程同时修改目录内容）。它是排他的，容易导致死锁。
引用计数（Ref Count）：保护的是对象的存在性（防止结构体被从内存中抹除）。它是共享的，且永远不会导致进程阻塞/睡眠；inode的某些属性从出生到死去不改变，保证存在实际上保证了这些属性在两把锁之间不变

某些数据项在不同时期受到不同机制的保护，有时它们并不依靠显式的锁，而是通过 xv6 代码的结构隐式地防止并发访问；例如物理页空闲时受到kmem保护，用作pipe受到管道的spinlock保护，在user-space未分配时中则不受保护【因为不会用】

还有若干不需要锁保护的多进程共享：比如acquire和release内的内存屏障，强制要求获取锁之后的代码必须严格在获取锁之后运行完成；某些属性只有本进程会修改，或者只会从0->1;proc结构体内有一些只有本进程关心的数据结构，不需要锁保护

# 2026年2月14日

## Lab Mmap: 添加mmap和munmap功能,要lazy-mapping

添加syscall流程：增加user.h的声明，在syscall.h增加系统调用号，syscall.c添加extern声明和实现，usys跳板汇编增加本调用项的entry
uprog增加应用程序加入编译列表

注意之前的lazy-alloction是虚页没有对应物理页，需要用到虚页对应的空间时分配一个实际空间；这里的lazy-mapping 是存在虚拟-物理页对应的，只是没有从disk读入mem,需要使用时分配物理页并读入；这里的对应信息应当存储在VMA，这就是为什么在页表之外需要维护VMA同样存储映射关系的原因
需要在用户虚页表中查找没用过的足够大的区域;unmap时注意lazy map导致的根本没有map的部分

无法从中断返回r_scause判断是由于缺少pte_V还是缺少PTE_R/PTE_W，需要读取pte判断

// RISC-V requires writable pages to also be readable
int perm = vma->prot;
if(perm & PTE_W)
perm |= PTE_R;
硬件认为纯写非法

VMA对本进程的file引用，和fd指针对本进程的file引用要分别维护;引入物理页引用计数实现对映射文件物理页的跨进程共享；实际上还有bcache和mmap之间的一致性需要解决，通过vma下虚拟地址到页缓存（Page Cache）物理页的绑定

# 2026年2月16日

Dune：一种为进程提供虚拟环境的技术，让本进程可以直接操纵内核和硬件；dune的意义在于改变了虚拟化技术的服务对象，从虚拟一个机器到为进程提供硬件级“插件”，证明虚拟化不仅仅是为了“多开系统”，它是为了“增强进程”；难度在于精准调整了进程需要的最小虚拟功能集合

原先为应用程序提供内核功能，要么允许app修改内核，要么把应用程序运行在专用的虚拟机【硬件到os】中【此时相当于一台独立的机器，虚拟机中的进程难以与host-os上的进程沟通】；Dune只为单个进程提供一种运行模式，不妨碍与其他进程IPC

这样减少了需要模拟的设备数量，在切换进程时更轻更快；dune把进程运行在non-root的ring0下，硬件视角是一个VM，但实际上没有模拟虚拟设备；dune把特定用户进程放在non-root的ring0中，相比虚拟硬件好处在于减少了虚拟设备的模拟，，部分内核操作自己处理，另一部分call host-os-kernel

所谓虚拟设备模拟，如果存在虚拟设备，io需要对虚拟设备寄存器进行读写，然后触发VMEXIT从真正设备中读写；不存在虚拟设备时也需要VMEXIT，但减少了VM的翻译工作【访问VM-device到发送VMEXIT信号】

软件模拟：对所有binary代码，检查其中的特权指令【由于guest-os实际运行在ring3,如果真的跑这个特权指令会报错】，更换为一段模拟效果的安全指令
硬件虚拟化：增加一个物理标志位“root/non-root mode”,各自包括ring0-ring3；让VM运行在Non-root模式的ring0下，特权指令不报错；部分危险动作会触发回到host-os的内核处理；可以把本进程的不可信部分跑在Non-root的ring3下

VMX 模式之间的转换由硬件管理。当 VMM 执行 VMLAUNCH 或 VMRESUME 指令时，硬件执行 VM entry（虚拟机进入）：将 CPU 置于 VMX non-root 模式并执行客户程序。随后，当需要 VMM 介入时，硬件执行 VM exit（虚拟机退出）：将 CPU 切回 VMX root 模式并跳转到 VMM 的入口点。硬件在两种转换过程中都会自动保存和恢复大部分架构状态。这是通过使用内存驻留数据结构中称为 VMCS（虚拟机控制结构） 的缓冲区来完成的

考虑guest使用内存，如果允许guest修改CR3页表寄存器，则guest可以自由地映射物理页，这是不安全的；引入EPT解决，让guest通过页表得到的GuestPA，查EPT页表得到HostPA；不引入时的一种方法是维护GVA->HPA[即前文所说自由映射]

让应用程序自行编写页表并不会影响安全性，因为底层的 EPT 只暴露了正常的进程地址空间，即便不使用 Dune，这部分空间也是可以访问的；

Dune可以实现一个进程内多张页表切换，这可以通过标签减少TLB刷新

# 2026年2月17日

![Dune system Architecture](image-14.png)
![Virtual memory in Dune](image-15.png)
EPT的格式是intel定义的；硬件限制non-root的虚拟空间只有36位，通过GPA到HPA的压缩映射实现48位地址的有效存储【这里指的是，只映射GPA中特定的12G，其他没有页表entry】

具体来说，Dune在处理硬件和系统交互时有几个与传统VMM不同之处：Hypercall直接通往host而不是发送给虚拟硬件、访问硬件时不模拟设备而直接连接系统服务、模式切换的开销远远小于传统VMM、Dune允许更自由的地址空间映射

Dune的内存管理，目标是默认提供一个普通的进程内存地址空间，允许用户程序仅添加其所需的功能，而不是完全取代内核级的内存管理

# 2026年2月18日

trap and emulate: guest-priviledge执行特权指令时trap，走到VMM中处理
这里注意”内核代码“和“特权指令”的区别，内核代码中不全是特权指令，大部分是普通的算术/内存访问/函数调用；guest中运行到ecall【priviledge】进入VMM,VMM更新虚拟和真实寄存器模拟状态，执行sret回到guest的trap-handler

VMM如何实现地址保护：shadow-page-table方案
guest内维护一个gva->gpa的页表，但是每当sfence.vma刷新页表或尝试写入satp寄存器来写一个新的pagetable时会创建一个VMM管理的shadow-pagetable【gva->hpa】，并把这个影子页表放入satp;从而实际上guest使用的是shadow-pagetable来实现在平坦gva上使用本进程分配的特定host-pa

VMM如何实现设备：策略1 Emulation：设置设备映射的内存pte为invaild，访问时trap到VMM中模拟响应并操作真实设备；法2建立在os知道自己运行在虚拟环境，将设备请求放入队列，VMM从队列中读取命令并执行

VT-x: Intel对虚拟机的支持
传统VMM用VMM上的软件维护各guest-os的寄存器;VT-x把guest的虚拟寄存器存储在内存【结构体VMCS】并允许Guest-os访问；non-root mode读写使用这套虚拟寄存器，root mode下VMM使用真实寄存器；这样允许guest-os直接读写内存中的特权寄存器，减少了trap数量；但是部分重要特权指令还是需要进入VMM
VT-x使用VMM控制的EPT实现内存的访问控制，负责GPA->HPA

为什么说Dune可以运行untrusted代码？可以在Dune进程中维护两个页表，分别在non-root/root运行untrusted/trusted代码，由于两份页表不重合，所以untrusted的代码不会访问到trusted代码的内存
为什么会加速查dirty？因为在guest-supervisor中可以直接从内存读取虚拟寄存器