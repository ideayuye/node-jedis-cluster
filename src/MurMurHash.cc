#include <node.h>;
#include <string.h>
using namespace v8;

struct ByteBufferAttr{
	bool bigEndian;
	char * key;
	int position;
	int limit;
};

/*
 *操作字节数组缓冲区 (依照java代码实现)
 */
class ByteBuffer
{
public:
	ByteBuffer();
	~ByteBuffer();
	void allocate(int size, char* str);
	void init(char* str);
	int remaining();
	void rewind();
	void order(char* bo);
	int nextGetIndex(int nb);
	long long getLong();
	struct ByteBufferAttr bba;

private:
	long long makeLong(int b7, int b6, int b5, int b4, int b3, int b2, int b1, int b0);
	long long getLongB(int bi);
	long long getLongL(int bi);
};

ByteBuffer::ByteBuffer()
{
}

ByteBuffer::~ByteBuffer()
{	
	ByteBufferAttr* b = &bba;
	if (NULL != b)
	{
		delete b;
		b = NULL;
	}
}

void ByteBuffer::allocate(int size, char* str){
	bba.key = new char[size];
	for (int i = 0; i <= size; i++){
		int index = i + bba.position;
		if (index < strlen(str)){
			bba.key[i] = str[index];
		}
		else{
			bba.key[i] = 0;
		}
	}
	bba.limit = size;
};
void ByteBuffer::init(char* str){
	bba.key = str;
	bba.limit = strlen(str);
	bba.position = 0;
	bba.bigEndian = true;
}
int ByteBuffer::remaining(){
	return bba.limit - bba.position;
}
void ByteBuffer::rewind(){
	bba.position = 0;
}
void ByteBuffer::order(char* bo){
	bba.bigEndian = (bo == "BIG_ENDIAN");
}
int ByteBuffer::nextGetIndex(int nb){
	if (bba.limit - bba.position >= nb){
		int p = bba.position;
		bba.position += nb;
		return p;
	}
}
long long ByteBuffer::makeLong(int b7, int b6, int b5, int b4, int b3, int b2, int b1, int b0){
	return  (((long long)b7) << 56) |
		(((long long)b6 & 0xff) << 48) |
		(((long long)b5 & 0xff) << 40) |
		(((long long)b4 & 0xff) << 32) |
		(((long long)b3 & 0xff) << 24) |
		(((long long)b2 & 0xff) << 16) |
		(((long long)b1 & 0xff) << 8) |
		(((long long)b0 & 0xff));
}
long long ByteBuffer::getLongB(int bi){
	char* bb = bba.key;
	return makeLong(bb[bi],
		bb[bi + 1],
		bb[bi + 2],
		bb[bi + 3],
		bb[bi + 4],
		bb[bi + 5],
		bb[bi + 6],
		bb[bi + 7]);
}
long long ByteBuffer::getLongL(int bi){
	char* bb = bba.key;
	return makeLong(bb[bi + 7],
		bb[bi + 6],
		bb[bi + 5],
		bb[bi + 4],
		bb[bi + 3],
		bb[bi + 2],
		bb[bi + 1],
		bb[bi]);
}

long long ByteBuffer::getLong(){
	return bba.bigEndian ? getLongB(nextGetIndex(8)) :
		getLongL(nextGetIndex(8));
}


ByteBuffer* bb = new ByteBuffer();
void mHash(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.Length() < 1) {
	  isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate,"Wrong number of arguments")));
  }

  if (!args[0]->IsString()) {
	  isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate,"Wrong arguments")));
  }

  //接收参数  key  和 seed
  String::Utf8Value para0(args[0]->ToString());
  char* key = *para0;
  long long seed = 0x1234ABCD;

  
  bb->init(key);
  bb->order("LITTLE_ENDIAN");


  long long m = 0xc6a4a7935bd1e995;
  int r = 47;

  long long h = seed ^ (bb->remaining() * m);

  long long k;
  unsigned long long utv;
  while (bb->remaining() >= 8) {
	  k = bb->getLong();

	  k *= m;
	  utv = (unsigned long long)k;
	  k = k ^ (utv >> r);
	  k *= m;

	  h ^= k;
	  h *= m;
  }

  if (bb->remaining() > 0) {
	  bb->allocate(8, key);
	  bb->order("LITTLE_ENDIAN");
	  bb->rewind();

	  h ^= bb->getLong();
	  h *= m;
  }

  utv = (unsigned long long)h;
  h ^= utv >> r;
  h *= m;
  utv = (unsigned long long)h;
  h ^= utv >> r;

  char ts[64];
  //linux %lld  win32 %I64d
  sprintf(ts, "%lld", h);

  Local<String> s = String::NewFromUtf8(isolate,ts);
  args.GetReturnValue().Set(s);
}


void init(Handle<Object> target) {
	NODE_SET_METHOD(target, "mHash", mHash);
}

NODE_MODULE(MurMurHash, init)
