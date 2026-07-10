package com.endeavor.service;

import com.endeavor.entity.ProgramItem;
import com.endeavor.repository.ProgramItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgramItemService {

    @Autowired
    private ProgramItemRepository itemRepository;

    public List<ProgramItem> getItemsByCategoryId(Long categoryId) {
        return itemRepository.findByCategoryIdOrderByDisplayOrderAsc(categoryId);
    }

    public ProgramItem saveItem(ProgramItem item) {
        return itemRepository.save(item);
    }

    public Optional<ProgramItem> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
}
