
import { supabase } from '@/integrations/supabase/client';
import heic2any from "heic2any";

// Função para converter qualquer imagem para JPG
async function convertToJpg(file: File): Promise<File> {
  // Se for HEIC, usa heic2any
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    const jpgBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    return new File([jpgBlob as BlobPart], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  }

  // Para outros formatos, usa canvas
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new window.Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas não suportado");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Falha ao converter para JPG");
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
// Função para criar buckets se não existirem
export const initializeStorage = async () => {
  try {
    // Verificar se o bucket 'images' existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return;
    }

    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      // Criar bucket 'images' se não existir
      const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Erro ao criar bucket images:', error);
      } else {
        console.log('Bucket images criado com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar storage:', error);
  }
};

// Função para upload de imagem
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  await initializeStorage();

  // Converte para JPG antes do upload
  const jpgFile = await convertToJpg(file);

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, jpgFile);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Função para formatar telefone brasileiro
export const formatPhoneBrazil = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Função para converter número em palavras (moeda brasileira)
export const numberToWordsBrazilian = (num: number): string => {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  if (num === 0) return 'zero reais';
  if (num === 1) return 'um real';
  if (num === 100) return 'cem reais';
  
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  
  let result = '';
  
  // Parte inteira
  if (intPart >= 1000) {
    const milhares = Math.floor(intPart / 1000);
    if (milhares === 1) {
      result += 'mil';
    } else {
      result += convertirCentenas(milhares) + ' mil';
    }
    
    const resto = intPart % 1000;
    if (resto > 0) {
      result += ' e ' + convertirCentenas(resto);
    }
  } else {
    result = convertirCentenas(intPart);
  }
  
  // Adicionar "reais"
  result += intPart === 1 ? ' real' : ' reais';
  
  // Parte decimal (centavos)
  if (decPart > 0) {
    result += ' e ';
    if (decPart === 1) {
      result += 'um centavo';
    } else {
      result += convertirCentenas(decPart) + ' centavos';
    }
  }
  
  return result;
  
  function convertirCentenas(num: number): string {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    
    let resultado = '';
    
    if (num >= 100) {
      resultado += centenas[Math.floor(num / 100)];
      const resto = num % 100;
      if (resto > 0) resultado += ' e ';
      num = resto;
    }
    
    if (num >= 20) {
      resultado += dezenas[Math.floor(num / 10)];
      const resto = num % 10;
      if (resto > 0) resultado += ' e ' + unidades[resto];
    } else if (num >= 10) {
      resultado += especiais[num - 10];
    } else if (num > 0) {
      resultado += unidades[num];
    }
    
    return resultado;
  }
};

